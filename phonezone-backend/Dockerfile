# 1. Build Phase
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copy the pom.xml and source code directly from Render's active directory
COPY pom.xml .
COPY src ./src

# Compile and package the executable jar file
RUN mvn clean package -DskipTests

# 2. Run Phase
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]