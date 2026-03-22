# Build
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q package

# Runtime — full JDK for jcmd / jmap / jstack inside the container
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

RUN mkdir -p /dumps && chmod 777 /dumps

COPY --from=build /app/target/*.jar /app/app.jar

VOLUME ["/dumps"]

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/heap-oom.hprof"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
