# javatest

Тестовый Spring Boot‑сервис с управляемой нагрузкой (CPU, память, потоки), логами фаз и Docker‑образом на **полном JDK** для снятия **JFR**, **heap dump** и **thread dump** через `jcmd`.

## Сборка и запуск локально

```bash
cd javatest
mvn -q -DskipTests package
java -jar target/javatest-1.0.0-SNAPSHOT.jar
```

- Health: `GET http://localhost:8080/actuator/health`
- Метрики: `GET http://localhost:8080/actuator/metrics`

## Docker

Сборка образа:

```bash
cd javatest
docker build -t javatest:local .
```

Запуск с томом для дампов (на Windows путь подставьте свой):

```bash
docker run --rm -p 8080:8080 -v javatest-dumps:/dumps --name javatest-run javatest:local
```

При необходимости (редко): `--cap-add=SYS_PTRACE`.

Переменная `JAVA_OPTS` переопределяет JVM‑флаги, например:

```bash
docker run --rm -p 8080:8080 -v javatest-dumps:/dumps -e "JAVA_OPTS=-Xms256m -Xmx768m" javatest:local
```

## HTTP: ручной запуск нагрузки

Все запросы **асинхронные** — ответ `202 Accepted`, нагрузка идёт в фоне.

| Метод | Описание |
|--------|----------|
| `POST /api/load/cpu?ms=5000` | Горячий цикл CPU заданное время (мс) |
| `POST /api/load/memory?mb=64&holdSeconds=20` | Удержание аллоцированной памяти (MiB, сек) |
| `POST /api/load/threads?n=32&ms=30000` | N потоков с лёгкой работой заданное время (мс) |

Примеры:

```bash
curl -X POST "http://localhost:8080/api/load/cpu?ms=10000"
curl -X POST "http://localhost:8080/api/load/memory?mb=128&holdSeconds=30"
curl -X POST "http://localhost:8080/api/load/threads?n=48&ms=60000"
```

## Планировщик фаз

По умолчанию включён (`javatest.schedule.enabled=true` в `application.yml`). Цикл: CPU → память → потоки → пауза (только лог).

Отключить:

```yaml
javatest:
  schedule:
    enabled: false
```

Или при запуске контейнера:

```bash
docker run --rm -p 8080:8080 -v javatest-dumps:/dumps \
  -e SPRING_APPLICATION_JSON='{"javatest":{"schedule":{"enabled":false}}}' \
  javatest:local
```

## Логи

В лог пишутся строки вида `phase=CPU_START`, `phase=MEMORY_ALLOCATED`, `phase=THREADS_END` и снимок `heapUsed=… heapMax=… threads=…` — удобно сопоставлять с моментом снятия дампа.

---

## Runbook: снятие дампов из контейнера

Предполагается, что процесс JVM в контейнере имеет **PID 1** (как в этом образе). Инструменты вызывайте **внутри** контейнера, версия JDK совпадает с приложением.

Подставьте имя или ID контейнера вместо `javatest-run`.

### Thread dump

```bash
docker exec javatest-run jcmd 1 Thread.print
```

Сохранить в том `/dumps`:

```bash
docker exec javatest-run sh -c 'jcmd 1 Thread.print > /dumps/thread-$(date +%s).txt'
```

### Heap dump (HPROF)

```bash
docker exec javatest-run jcmd 1 GC.heap_dump /dumps/heap.hprof
```

Анализ: Eclipse MAT, VisualVM, JProfiler и т.п.

### JFR (Java Flight Recorder)

Разовая запись 60 секунд:

```bash
docker exec javatest-run jcmd 1 JFR.start name=rec1 duration=60s filename=/dumps/rec1.jfr
```

Ручной цикл (старт → дамп → стоп):

```bash
docker exec javatest-run jcmd 1 JFR.start name=rec2
docker exec javatest-run jcmd 1 JFR.dump name=rec2 filename=/dumps/rec2.jfr
docker exec javatest-run jcmd 1 JFR.stop name=rec2
```

Просмотр `.jfr`: **JDK Mission Control (JMC)**.

### Копирование файлов с тома на хост

Если использовали именованный volume:

```bash
docker run --rm -v javatest-dumps:/dumps -v "%cd%:/out" alpine cp /dumps/rec1.jfr /out/
```

(На Linux/macOS замените путь к хосту соответственно.)

Или `docker cp javatest-run:/dumps/rec1.jfr .`

---

## Ограничения

- Параметры нагрузки намеренно ограничены (память до 512 MiB за запрос, потоки до 256 и т.д.), чтобы случайно не положить хост.
- Для OOM автоматически может быть записан дамп в `/dumps/heap-oom.hprof` (см. `JAVA_OPTS` в Dockerfile).
