# Сеть, хранилище и эксплуатация

## Какие бывают Service и чем ClusterIP отличается от NodePort и LoadBalancer?

Service — стабильная точка входа на набор Pod'ов. ClusterIP (default) — внутренний VIP кластера. NodePort — ClusterIP + порт на каждом узле. LoadBalancer — NodePort + внешний балансировщик облака.

```yaml
kind: Service
spec:
  type: ClusterIP        # только внутри кластера
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]
```

NodePort (30000-32767) — быстрый «внешний» доступ для тестов, не для прода: SPA-балансировка ручная. LoadBalancer — стандартный облачный вход; Ingress перед ним экономит облачные LB: один LB → много Ingress-правил.

## Что такое Ingress и зачем он нужен?

HTTP/HTTPS-роутинг снаружи кластера к Service'ам: по хосту и пути, с TLS-терминацией. Требует Ingress-контроллера (nginx, traefik, cloud-native).

```yaml
kind: Ingress
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: api, port: { number: 80 } }
  tls:
    - hosts: [api.example.com]
      secretName: api-tls
```

Без Ingress: каждый сервис = свой LoadBalancer-IP и TLS. С Ingress: одна точка входа, сертификаты, роутинг, rate-limit (у контроллера) — декларативно.

## Как работает DNS внутри кластера?

kube-dns/CoreDNS создаёт записи для Service: `service.namespace.svc.cluster.local`. Поддомены FQDN одинаковы из любого namespace.

```bash
# из Pod'а:
curl http://api                    # тот же namespace
curl http://api.production         # другой namespace
curl http://api.production.svc     # полностью
```

Headless Service (clusterIP: None) — DNS напрямую на Pod'ы (по одному IP): основа StatefulSet-кластеров, где нужны адреса конкретных членов (postgres-0, postgres-1).

## Что такое ConfigMap и Secret?

ConfigMap — конфигурация (текст/env), Secret — «секретные» данные (base64, не шифрование). Оба подключаются как env-переменные или файлы.

```yaml
kind: Secret
type: Opaque
stringData:                 # stringData — прямо текст
  DATABASE_URL: postgres://app:pass@db:5432/app

# в Pod'е:
envFrom:
  - secretRef: { name: api-secrets }
```

Ограничения Secret: base64 ≠ защита (включить encryption at rest на etcd, RBAC на чтение). Внешние хранилища — External Secrets Operator/Vault: секреты синхронизируются из облака/HashiCorp Vault.

## Как устроено хранилище: PV, PVC и StorageClass?

PVC — заявка приложения на том («мне нужно 10Gi RWO»). StorageClass — «как создавать» (провайдер, параметры). PV — фактический том, связанный с заявкой.

```yaml
kind: PersistentVolumeClaim
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests: { storage: 10Gi }
  storageClassName: fast-ssd
```

Жизненный цикл: Pod ссылается на PVC; удаление Pod'а том не трогает. reclaimPolicy (Delete/Retain) — что происходит с PV после удаления PVC. StatefulSet через volumeClaimTemplates создаёт PVC на каждый Pod автоматически.

## Что такое PodDisruptionBudget и зачем он?

Гарантия минимального числа живых реплик при добровольных выселениях ( drains: обновление узлов, автомасштабирование узлов).

```yaml
kind: PodDisruptionBudget
spec:
  minAvailable: 2         # или maxUnavailable: 1
  selector:
    matchLabels: { app: api }
```

PDB не защищает от отказов (об этом — replicas контроллера), только от «добровольных» вмешательств: node upgrade по одному Pod'у за раз. Без PDB drain узла может снять все реплики приложения сразу.

## Как диагностировать CrashLoopBackOff и Pending?

CrashLoopBackOff — контейнер падает и перезапускается с экспоненциальной задержкой. Причины: ошибка приложения (смотреть logs --previous), failed probe, OOMKilled. Pending — Pod не scheduled: не хватает ресурсов, нет узла под nodeSelector/tolerations, PVC не биндится.

```bash
kubectl describe pod api-xyz | grep -A5 Events
kubectl logs api-xyz --previous      # логи упавшего контейнера
kubectl get events --sort-by=.lastTimestamp
```

Алгоритм всегда один: describe → Events (почему) → logs/previous (чем упал) → проверка probes/limits. ImagePullBackOff — отдельный случай: неверный тег или отсутствие прав на registry (imagePullSecrets).

## Что обязательно мониторить в Kubernetes?

Четыре слоя: кластер (узлы, etcd, компоненты control plane), Pod'ы (restarts, OOM, throttling), приложения (метрики, логи, трейсы), SLO (доступность и латенти с точки зрения пользователя).

```bash
kubectl top pods                 # текущее потребление
kubectl get pods -w              # живой статус
```

Прод-стек: Prometheus + Grafana + Alertmanager (метрики), Loki/ELK (логи), cAdvisor/kube-state-metrics (экспортёры). Золотые сигналы: латентность, трафик, ошибки, насыщение. Алерты типа «Pod перезапущен» без контекста бесполезны; алерты по SLO — полезны.
