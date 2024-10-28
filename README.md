[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://discord.gg/GUAy9wErNu)
[![](https://img.shields.io/discord/908084610158714900)](https://discord.gg/GUAy9wErNu)
[![Static Badge](https://img.shields.io/badge/github-assemblyline-blue?logo=github)](https://github.com/CybercentreCanada/assemblyline)
[![Static Badge](https://img.shields.io/badge/github-assemblyline--ui--frontend-blue?logo=github)](https://github.com/CybercentreCanada/assemblyline-ui-frontend)
[![GitHub Issues or Pull Requests by label](https://img.shields.io/github/issues/CybercentreCanada/assemblyline/ui-frontend)](https://github.com/CybercentreCanada/assemblyline/issues?q=is:issue+is:open+label:ui-frontend)
[![License](https://img.shields.io/github/license/CybercentreCanada/assemblyline-ui-frontend)](./LICENSE.md)

# Assemblyline UI Frontend

This repo is dedicated for the new version of Assemblyline 4 UI. It uses the React library and Material UI for the visual components.

## Image variants and tags

| **Tag Type** | **Description**                                                                                  |      **Example Tag**       |
| :----------: | :----------------------------------------------------------------------------------------------- | :------------------------: |
|    latest    | The most recent build (can be unstable).                                                         |          `latest`          |
|  build_type  | The type of build used. `dev` is the latest unstable build. `stable` is the latest stable build. |     `stable` or `dev`      |
|    series    | Complete build details, including version and build type: `version.buildType`.                   | `4.5.stable`, `4.5.1.dev3` |

#### Running this component

```bash
docker run --name frontend cccs/assemblyline-ui-frontend
```

## Development

For information on frontend development, follow this [guide](https://cybercentrecanada.github.io/assemblyline4_docs/developer_manual/frontend/frontend/).

## Documentation

For more information about this Assemblyline component, follow this [overview](https://cybercentrecanada.github.io/assemblyline4_docs/overview/architecture/) of the system's architecture.

---

# Front-end de l'interface utilisateur d'Assemblyline

Ce repo est dédié à la nouvelle version d'Assemblyline 4 UI. Elle utilise la bibliothèque React et Material UI pour les composants visuels.

## Variantes et étiquettes d'image

| **Type d'étiquette** | **Description**                                                                                                  |  **Exemple d'étiquette**   |
| :------------------: | :--------------------------------------------------------------------------------------------------------------- | :------------------------: |
|       dernière       | La version la plus récente (peut être instable).                                                                 |          `latest`          |
|      build_type      | Le type de compilation utilisé. `dev` est la dernière version instable. `stable` est la dernière version stable. |     `stable` ou `dev`      |
|        séries        | Le détail de compilation utilisé, incluant la version et le type de compilation : `version.buildType`.           | `4.5.stable`, `4.5.1.dev3` |

#### Exécuter ce composant

```bash
docker run --name frontend cccs/assemblyline-ui-frontend
```

## Développement

Pour des informations sur le développement du frontend, suivez ce [guide](https://cybercentrecanada.github.io/assemblyline4_docs/developer_manual/frontend/frontend/).

## Documentation

Pour plus d'informations sur ce composant Assemblyline, suivez ce [overview](https://cybercentrecanada.github.io/assemblyline4_docs/overview/architecture/) de l'architecture du système.
