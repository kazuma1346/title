# 1. Build Stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Renderの無料枠（512MB）でのビルド時のメモリ不足（OOM）を防ぐ設定
ENV MAVEN_OPTS="-Xmx256m"

# 依存関係の解決
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline

# ソースコードをコピーしてビルド
COPY backend/src ./src
RUN ./mvnw package -DskipTests

# 2. Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# ビルドしたJARをコピー
COPY --from=build /app/target/*.jar app.jar

# Renderから指定されるPORT環境変数
ENV PORT=8080
EXPOSE ${PORT}

# Renderで提供される DATABASE_URL を JDBC URLの形式に自動変換して起動する
ENTRYPOINT ["sh", "-c", "\
  if [ -n \"$DATABASE_URL\" ]; then \
    export SPRING_DATASOURCE_URL=\"$(echo $DATABASE_URL | sed 's/^postgres:/jdbc:postgresql:/')\"; \
    export SPRING_DATASOURCE_DRIVER=\"org.postgresql.Driver\"; \
    export SPRING_JPA_DATABASE_PLATFORM=\"org.hibernate.dialect.PostgreSQLDialect\"; \
  fi; \
  export SERVER_PORT=${PORT}; \
  java -Xmx256m -jar app.jar \
"]
