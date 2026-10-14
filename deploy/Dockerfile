FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --chown=app:app . .
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080 \
    CATALOG_PATH=/app/catalog.json
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "GuiaDaTi.Api.dll"]
