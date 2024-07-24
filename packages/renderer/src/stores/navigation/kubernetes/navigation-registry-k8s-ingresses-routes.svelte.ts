/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import IngressRouteIcon from '/@/lib/images/IngressRouteIcon.svelte';

import {
  kubernetesCurrentContextIngresses,
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextRoutes,
} from '../../kubernetes-contexts-state';
import type { NavigationRegistryEntry } from '../navigation-registry';

let ingressesCount = 0;
let routesCount = 0;
let count = $state(0);

export function createNavigationKubernetesIngressesRoutesEntry(): NavigationRegistryEntry {
  kubernetesCurrentContextIngresses.subscribe(value => {
    ingressesCount = value.length;
    count = ingressesCount + routesCount;
  });
  kubernetesCurrentContextRoutes.subscribe(value => {
    routesCount = value.length;
    count = ingressesCount + routesCount;
  });

  kubernetesCurrentContextNodes.subscribe(nodes => {
    count = nodes.length;
  });
  const registry: NavigationRegistryEntry = {
    name: 'Ingresses & Routes',
    icon: { iconComponent: IngressRouteIcon },
    link: '/ingressesRoutes',
    tooltip: 'Ingresses & Routes',
    type: 'entry',
    get counter() {
      return count;
    },
  };
  return registry;
}
