---
sidebar_position: 1
title: Kind support
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Running Kubernetes on your workstation with Kind

[Kind](https://kind.sigs.k8s.io/) is a command line tool that can create Kubernetes clusters on your favorite container engine.

It has experimental support for Podman.
However, Kind has specific requirements that need configuration tuning.

## Running Kind on Windows Subsystem for Linux (WSL)

When you create a Podman machine, Podman creates two system connections:

* A rootless connection
* A rootful connection, which has a `-root` suffix

Kind uses the default Podman connection.

Due to incompatibilities between WSL and systemd, Kind does not work with the [rootless mode](https://docs.podman.io/en/latest/markdown/podman.1.html#rootless-mode).

Therefore, set the default connection to rootful.

### Creating a Podman machine ready to run Kind

You can create a rootful Podman machine.
It does not require additional configuration.

#### Prerequisites

* No existing Podman machine

#### Procedure

* Create a rootful Podman machine:

  ```shell-session
  $ podman machine init --rootful my-machine-name
  ```

### Configuring an existing Podman machine to run Kind

Set the Podman machine default connection to rootful.

#### Procedure

1. List the Podman system connections:

   ```shell-session
   $ podman system connection ls
   ```

   You should see a similar output:

   ```shell-session
   Name                         URI                                                          Identity                                   Default
   podman-machine-default       ssh://user@localhost:54133/run/user/1000/podman/podman.sock  C:\Users\Jeff\.ssh\podman-machine-default  true
   podman-machine-default-root  ssh://root@localhost:54133/run/podman/podman.sock            C:\Users\Jeff\.ssh\podman-machine-default  false
   ```

2. Set the Podman system default connection to connection that has the `-root` suffix:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```



### Restarting a Podman machine running Kind on Windows

On Windows/WSL, avoid stopping the Podman machine while one or several Kind clusters are running. 
The stop command emits an error message, and the following Podman machine start seems to fail.

#### Procedure

1. Stop all existing Kind clusters.
2. Stop the Podman machine.
3. Start the Podman machine.

#### Workaround

1. Keep existing Kind clusters running.
2. Stop the Podman machine.
3. Start the Podman machine.
4. The Podman machine start reports success, but you cannot connect to the Podman machine.
5. Stop the Podman machine.
6. Start the Podman machine.

#### Additional resources

* [Kind](https://kind.sigs.k8s.io/)

## Restarting your Kind clusters

:::caution
Kind cluster restart does not work in all environments. It is based on system features that may not be available on all
configuration. Windows/WSL is an example of such configuration.
:::

Kind does not provide start and stop command on Kind clusters. With Kind, you can only create and delete clusters. As
delete will remove all the cluster configuration, users are not using it frequently.

So there are some use cases where users may want to restart a Kind cluster. This is happening when the Podman system is stopped:
in that case the container that was launched by the `kind create cluster` command may be switched to the stopped state
but may not be removed so it may be restarted.

### Identify stopped Kind clusters

Kind clusters that are in the stopped state are reported by the `kind get clusters` command and their corresponding
container is in the `Created` state. To list the containers for the Kind clusters, run the following command:

<Tabs>
  <TabItem value="Linux/MacOS" label="Linux/MacOS">

  ```shell-session
  $ podman ps -a | grep control-plane
  ```
  
  </TabItem>
  <TabItem value="Windows" label="Windows">

  ```shell-session
  $ podman ps -a | find "control-plane"
  ```

  </TabItem>
</Tabs>

If the container status is `Created` and not `Up...` then the Kind cluster is stopped and you can restart it with:

  ```shell-session
  $ podman start container-name
  ```

#### Verification

Before you check that the cluster is up and running using `kubectl`, you must first set the `kubectl` context to that
cluster.
So if your Kind cluster is called `cluster_name`, run the following command:

  ```shell-session
  $ kubectl config use-context kind-cluster_name
  ```

You can now run the following command to list all namespaces from the Kind cluster:

  ```shell-session
  $ kubectl get ns
  ```




