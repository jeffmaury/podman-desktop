---
sidebar_position: 1
title: Kind support
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Running Kubernetes on your workstation with Kind and Podman

[Kind](https://kind.sigs.k8s.io/) is a command line tool for running local Kubernetes clusters on a container engine, such as Podman.

## Running Kind on Windows Subsystem for Linux (WSL)

When you create a Podman machine, Podman creates two system connections:

* A rootless connection, which is the default.
* A rootful connection, which has a `-root` suffix.

Kind uses the default Podman connection.

Due to incompatibilities between WSL and systemd, Kind does not work with the [rootless mode](https://docs.podman.io/en/latest/markdown/podman.1.html#rootless-mode).

Therefore, set the default connection to rootful.

### Creating a Podman machine ready to run Kind

Create a rootful Podman machine.
It does not require additional configuration.

#### Prerequisites

* No existing Podman machine

#### Procedure

* Create a rootful Podman machine:

  ```shell-session
  $ podman machine init --rootful my-machine-name
  ```

#### Next steps

* [Create your Kind cluster](#kind-create-cluster)

### Configuring an existing Podman machine to run Kind

Set the Podman machine default connection to rootful.

#### Procedure

1. List the Podman system connections:

   ```shell-session
   $ podman system connection ls
   ```

2. Set the Podman system default connection to connection that has the `-root` suffix:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```

#### Next steps

* [Create your Kind cluster](#kind-create-cluster)

## Creating a Kubernetes cluster with Kind {#kind-create-cluster}

#### Prerequisites

* Podman
* [Kind](https://kind.sigs.k8s.io/)

#### Procedure

* Create a Kubernetes cluster

   ```shell-session
   $ kind create cluster
   ```

## Stopping your Kind cluster {#stopping-kind}

Stop your Kind container before stopping the Podman machine, to avoid connection errors after restart.

#### Procedure

1. Go to **Containers**.
2. Search containers: `control-plane`, and identify your Kind cluster in  the list.
3. Click the **Stop Container** button.

#### Next steps

1. Stop the Podman machine or reboot your computer.
2. [Restart your Kind cluster](#restarting-kind).

## Restarting your Kind cluster {#restarting-kind}

Kind has no command to restart a cluster.
However, you can stop and start the container containing your Kind cluster.

#### Prerequisites

* [You stopped the Kind container before stopping the Podman machine](#stopping-kind).

#### Procedure 

1. Go to **Containers**.
2. Search containers: `control-plane`, and identify your Kind cluster in  the list.
3. Click the **Start Container** button.
4. Get your Kubernetes context list, and identify your Kind cluster in the list: it has a `kind-` prefix:

   ```shell-session
   $ kubectl config get-contexts
   ```

5. Set your Kubernetes context to your Kind cluster:

   ```shell-session
   $ kubectl config use-context kind-<cluster_name>
   ```

#### Verification

* List all namespaces from the Kind cluster:

  ```shell-session
  $ kubectl get ns
  ```




