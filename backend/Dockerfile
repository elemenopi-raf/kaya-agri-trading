FROM icr.io/appcafe/open-liberty:kernel-slim-java17-openj9-ubi

ARG POSTGRESQL_VERSION=42.7.1

ADD --chown=1001:0 https://repo1.maven.org/maven2/org/postgresql/postgresql/${POSTGRESQL_VERSION}/postgresql-${POSTGRESQL_VERSION}.jar /config/lib/

COPY --chown=1001:0 src/main/resources/server.xml /config/
COPY --chown=1001:0 target/kaya-agri-backend.war /config/apps/

RUN features.sh
