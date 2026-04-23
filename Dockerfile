# 1. Build Stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Maven Wrapperとpom.xmlをコピーして依存関係を解決
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

# Renderから指定されるPORT環境変数（デフォルト8080）
ENV PORT=8080
EXPOSE ${PORT}

# Renderで提供される DATABASE_URL (postgres://...) を JDBC URLの形式に自動変換して起動する
ENTRYPOINT ["sh", "-c", "\
  if [ -n \"$DATABASE_URL\" ]; then \
    export SPRING_DATASOURCE_URL=\"$(echo $DATABASE_URL | sed 's/^postgres:/jdbc:postgresql:/')\"; \
    export SPRING_DATASOURCE_DRIVER=\"org.postgresql.Driver\"; \
    export SPRING_JPA_DATABASE_PLATFORM=\"org.hibernate.dialect.PostgreSQLDialect\"; \
  fi; \
  export SERVER_PORT=${PORT}; \
  java -jar app.jar \
"]
