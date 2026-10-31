# Основы Kubernetes

## Что такое Kubernetes и какие задачи он решает?

Платформа оркестрации контейнеров: управляет запуском и масштабированием контейнерных приложений на кластере машин. Берёт на себя: размещение контейнеров по узлам (scheduling), восстановление после отказов (self-healing), масштабирование, rolling-обновления, сервис-дисковери и балансировку.

```
Вы описываете ЖЕЛАЕМОЕ состояние (YAML): "3 реплики моего API"
K8s непрерывно сводит ФАКТИЧЕСКОЕ к желаемому
```

Kubernetes — не PaaS: он не собирает образы и не деплоит код сам, он исполняет описанные манифесты. Изменение желаемого состояния — это и есть деплой.

## Как устроена архитектура: control plane и node?

Control plane (мастер): API-сервер (вход для всех команд), etcd (хранилище состояния), scheduler (раскладывает Pod'ы по узлам), controller-manager (сводит факт к желаемому). Node (воркер): kubelet (агент, запускает контейнеры), kube-proxy (сеть), container runtime (containerd).

```
kubectl → API Server → etcd
                      ↓
              Scheduler → "какому узлу этот Pod?"
                      ↓
Node: kubelet → container runtime → контейнеры
```

Все компоненты общаются только через API-сервер — нет прямых обращений к etcd. Это делает API единственным источником правды: kubectl, CI, операторы — все клиенты одного API.

## Что такое Pod и почему в нём может быть несколько контейнеров?

Pod — минимальная единица развертывания: один или несколько контейнеров с общей сетью (один IP, общие volumes) и жизненным циклом. Контейнеры в Pod'е всегда на одном узле.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: api
      image: myapp:1.0
    - name: log-sidecar     # sidecar-паттерн
      image: log-collector:1.0
```

Основной сценарий нескольких контейнеров — sidecar: лог-агент, прокси (service mesh), адаптер. Само приложение — почти всегда единственный контейнер в Pod'е.

## Что делает kubectl и какие базовые команды?

CLI к API-серверу: CRUD ресурсов, логи, exec, порт-форвардинг, применение манифестов.

```bash
kubectl apply -f deployment.yaml   # создать/обновить по манифесту
kubectl get pods -o wide          # список Pod'ов (+ узлы, IP)
kubectl describe pod api-xyz      # детали: события, причины проблем
kubectl logs -f api-xyz           # логи контейнера
kubectl exec -it api-xyz -- sh    # shell внутрь
kubectl port-forward svc/api 8080:80  # локальный доступ к сервису
```

`apply` — декларативно (желаемое состояние из файла), `create/delete` — императивно. `describe` — первый инструмент диагностики: раздел Events показывает, что с Pod'ом происходило.

## Что такое Namespace и зачем разбивать ресурсы?

Виртуальный кластер внутри кластера: изоляция ресурсов по командам/окружениям, права и квоты — на namespace.

```bash
kubectl get ns
kubectl -n production get pods    # ресурсы конкретного namespace
kubectl config set-context --current --namespace=team-a
```

Системные (kube-system), инструменты (monitoring) и приложения живут раздельно. Не путать с изоляцией безопасности: NetworkPolicy — отдельный механизм; без него namespace'ы друг друга «видят» по сети.

## Как выглядит типичный манифест Deployment?

Манифест — YAML с apiVersion, kind, metadata, spec. Deployment управляет ReplicaSet'ами, которые держат количество реплик Pod'ов.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:                  # шаблон Pod'а
    metadata:
      labels: { app: api }    # должен совпадать с selector
    spec:
      containers:
        - name: api
          image: myapp:1.4.2
          ports: [{ containerPort: 3000 }]
```

`selector.matchLabels` ↔ `template.labels` — связь Deployment с его Pod'ами. Ошибка в совпадении — манифест применится, но Pod'ы будут «ничьи».

## Как обновлять приложения: механизм rollout?

Смена образа в Deployment запускает rolling update: K8s постепенно создаёт Pod'ы новой версии и удаляет старые по стратегии (по умолчанию 25% вверх/вниз).

```bash
kubectl set image deployment/api api=myapp:1.4.3
kubectl rollout status deployment/api    # прогресс
kubectl rollout history deployment/api   # ревизии
kubectl rollout undo deployment/api       # откат на предыдущую
```

Rollback — тоже rollout (к прошлому ReplicaSet). Условие безопасного отката: обратимая схема БД; смены схемы и кода координируются (expand-contract).

## Как попадает трафик: Service и кратко Ingress?

Pod-IP эфемерны; Service — стабильный адрес (ClusterIP) для набора Pod'ов по label-селектору. Ingress — HTTP-маршрутизация снаружи к Service'ам.

```yaml
kind: Service
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]
```

```
Internet → Ingress (host/path) → Service → Pod'ы
```

Внутри кластера: `http://api.production.svc.cluster.local` — DNS-имя Service'а. Это ответ на «как найти мой сервис»: не IP, а имя через kube-dns.
