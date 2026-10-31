# Pod'ы и контроллеры

## Чем Deployment отличается от «голого» Pod'а?

Deployment — контроллер: держит N реплик, пересоздаёт умершие Pod'ы, обновляет версию. «Голый» Pod не восстанавливается после удаления и не масштабируется — Kubernetes его просто не чинит.

```yaml
# Deployment: "хочу 3 реплики, живые, версии 1.4.2"
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers: [{ name: api, image: myapp:1.4.2 }]
```

Голые Pod'ы уместны для отладки (`kubectl run test --rm -it --image=busybox -- sh`), не для рабочих нагрузок. Даже единственный экземпляр приложения — Deployment с replicas: 1.

## Что такое ReplicaSet и зачем, если есть Deployment?

ReplicaSet — контроллер, гарантирующий количество одинаковых Pod'ов по селектору. Deployment управляет ReplicaSet'ами: каждая версия — новый ReplicaSet, что и даёт rolling update и rollback.

```
Deployment (v1.4.3)
 └─ ReplicaSet (v1.4.3) → 3 Pod'а
 └─ ReplicaSet (v1.4.2) → 0 Pod'ов (для отката)
```

Напрямую ReplicaSet почти не используют: обновление версий — прерогатива Deployment. Знание об этом уровне объясняет, «откуда берутся» Pod'ы и почему rollback мгновенный: старый ReplicaSet просто масштабируется обратно.

## Чем StatefulSet отличается от Deployment?

StatefulSet — стабильная идентичность (имена-0, -1, -2), стабильное хранилище (PVC на Pod), упорядоченные rolling/scale. Для stateful-нагрузок: базы данных, брокеры, кластеры.

```yaml
kind: StatefulSet
spec:
  serviceName: postgres
  replicas: 3
  # каждый Pod: postgres-0, postgres-1, postgres-2
  # PVC: data-postgres-0 … закреплены за Pod'ами навсегда
```

StatefulSet не «пересоздаёт» Pod в другом месте с чужим диском: postgres-2 умирает → новый postgres-2 с тем же томом. Приложение должно уметь формировать кворум/репликацию — часто через headless Service (DNS на каждый Pod).

## Что такое DaemonSet и когда его применяют?

DaemonSet — по одному Pod'у на каждый узел кластера. Новые узлы автоматически получают Pod.

```yaml
kind: DaemonSet
# типовые жители:
# - node-exporter (метрики узла)
# - log-collector (fluentd)
# - CNI/сетевые агенты
```

Использование: мониторинг, логи, хранение (Ceph), сетевые агенты — всё, что должно работать на каждом узле. Регулируется на уровне узла: nodeSelector/affinity, tolerations для tainted-узлов.

## Что такое Job и CronJob?

Job — запускает Pod до успешного завершения (batch-задача). CronJob — Job по расписанию.

```yaml
kind: CronJob
spec:
  schedule: "0 3 * * *"
  jobTemplate:
    spec:
      backoffLimit: 3
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: report
              image: reports:1.0
```

Задача Job — «завершиться успехом»: без успеха и backoffLimit Pod'ы перезапускаются, Job висит. Идемпотентность обязательна: запуск может повториться (таймаут контроллера, рестарт узла). `concurrencyPolicy` CronJob — что делать с наложением расписаний (Forbid/Replace/Allow).

## Что делают probes: liveness, readiness, startup?

Три зонда в один контейнер. Liveness — «жив ли»: провал → перезапуск контейнера. Readiness — «готов принимать трафик»: провал → исключение из Service. Startup — «ещё стартует»: до первого успеха остальные зонды ждут.

```yaml
livenessProbe:
  httpGet: { path: /health, port: 3000 }
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /ready, port: 3000 }
  periodSeconds: 5
startupProbe:
  httpGet: { path: /health, port: 3000 }
  periodSeconds: 5
  failureThreshold: 30   # до 150 секунд на старт
```

Классика: liveness на эндпоинт с проверкой БД → недоступность зависимости перезапускает все Pod'ы (каскад). Liveness — только живость процесса; готовность к зависимостям — readiness.

## Как задавать ресурсы: requests и limits?

Requests — гарантированные ресурсы (влияют на scheduling); limits — потолок (CPU — троттлинг, память — OOMKill).

```yaml
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 256Mi }
```

Без requests Pod попадает на любой узел — BestEffort, первый кандидат на выселение. Без limits — сосед по узлу может задушить всех. Память сверх limit = OOMKilled (Exit Code 137): процесс убивается сразу, JVM/Node не успевают «аккуратно».

## Что такое HPA и как он масштабирует приложения?

Horizontal Pod Autoscaler — меняет replicas Deployment по метрике (CPU, память, кастомные метрики через metrics-server/прометеус-адаптер).

```yaml
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef: { kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
```

Условие работы — заданные requests (иначе нечего мерить). Синергия с PDB (PodDisruptionBudget): автомасштабирование не должно выкашивать все реплики разом. Отдельная тема — масштабирование до нуля (KEDA, Knative). VPA — альтернатива по вертикали: правит requests.
