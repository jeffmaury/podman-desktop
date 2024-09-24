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

import * as os from 'node:os';

import { PodmanMachineDetails } from '../model/pages/podman-machine-details-page';
import { PodmanOnboardingPage } from '../model/pages/podman-onboarding-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { deletePodmanMachine, handleConfirmationDialog } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const DEFAULT_PODMAN_MACHINE = 'Podman Machine';
const DEFAULT_PODMAN_MACHINE_VISIBLE = 'podman-machine-default';
const ROOTLESS_PODMAN_MACHINE_VISIBLE = 'podman-machine-rootless';
const ROOTLESS_PODMAN_MACHINE = 'Podman Machine rootless';
const RESOURCE_NAME = 'podman';

test.skip(os.platform() === 'linux', 'Tests suite should not run on Linux platform');

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('podman-machine-tests');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial(`Podman machine switching validation `, () => {
  test('Check data for available Podman Machine and stop machine', async ({ page, navigationBar }) => {
    await test.step('Open resources page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    await test.step('Check default podman machine', async () => {
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      const resourcesPodmanConnections = new ResourceConnectionCardPage(
        page,
        RESOURCE_NAME,
        DEFAULT_PODMAN_MACHINE_VISIBLE,
      );
      await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: 10_000 });
      await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: 20_000 });
      await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
      await resourcesPodmanConnections.resourceElementDetailsButton.click();
    });

    await test.step('Check default podman machine details', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);
      await test.step('Ensure default podman machine is RUNNING', async () => {
        await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 50_000 });
      });

      await test.step('Stop default podman machine', async () => {
        await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
        await podmanMachineDetails.podmanMachineStopButton.click();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 50_000 });
      });
    });
  });

  test('Create rootless podman machine', async ({ page, navigationBar }) => {
    test.setTimeout(200_000);

    await test.step('Open resources page', async () => {
      const dashboard = await navigationBar.openDashboard();
      await playExpect(dashboard.heading).toBeVisible();
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    const resourcesPage = new ResourcesPage(page);
    await test.step('Go to create new podman machine page', async () => {
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
    });

    const podmanMachineCreatePage = new PodmanOnboardingPage(page);
    await test.step('Fill in podman machine name input box', async () => {
      await playExpect(podmanMachineCreatePage.podmanMachineName).toBeVisible();
      await podmanMachineCreatePage.podmanMachineName.clear();
      await podmanMachineCreatePage.podmanMachineName.fill(ROOTLESS_PODMAN_MACHINE_VISIBLE);
    });

    await test.step('Set podman machine to be rootless', async () => {
      await playExpect(podmanMachineCreatePage.podmanMachineRootfulCheckbox).toBeChecked();
      await podmanMachineCreatePage.podmanMachineRootfulCheckbox.locator('..').click();
      await playExpect(podmanMachineCreatePage.podmanMachineRootfulCheckbox).not.toBeChecked();
    });

    await test.step('Set podman machine to not start after creation', async () => {
      await playExpect(podmanMachineCreatePage.podmanMachineStartAfterCreationCheckbox).toBeChecked();
      await podmanMachineCreatePage.podmanMachineStartAfterCreationCheckbox.locator('..').click();
      await playExpect(podmanMachineCreatePage.podmanMachineStartAfterCreationCheckbox).not.toBeChecked();
    });

    await test.step('Create podman machine', async () => {
      await podmanMachineCreatePage.podmanMachineCreateButton.click();
      await playExpect(podmanMachineCreatePage.goBackButton).toBeEnabled({ timeout: 180_000 });
      await podmanMachineCreatePage.goBackButton.click();
    });

    await playExpect(resourcesPage.heading).toBeVisible();
  });

  test('Switch to rootless podman machine', async ({ page }) => {
    await test.step('Go to rootless podman machine details page', async () => {
      const resourcesPodmanConnections = new ResourceConnectionCardPage(
        page,
        RESOURCE_NAME,
        ROOTLESS_PODMAN_MACHINE_VISIBLE,
      );

      await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible({ timeout: 30_000 });
      await resourcesPodmanConnections.resourceElementDetailsButton.click();
    });

    await test.step('Check rootless podman machine details', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, ROOTLESS_PODMAN_MACHINE);
      await test.step('Ensure rootless podman machine is OFF', async () => {
        await playExpect(podmanMachineDetails.podmanMachineName).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF');
      });

      await test.step('Start rootless podman machine', async () => {
        await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
        await podmanMachineDetails.podmanMachineStartButton.click();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 50_000 });
      });

      await handleConfirmationDialog(page, 'Podman', true, 'Yes');
      await handleConfirmationDialog(page, 'Podman', true, 'OK');
    });
  });

  test('Stop rootless podman machine', async ({ page }) => {
    const podmanMachineDetails = new PodmanMachineDetails(page, ROOTLESS_PODMAN_MACHINE);
    await test.step('Ensure rootless podman machine is RUNNING', async () => {
      await playExpect(podmanMachineDetails.podmanMachineName).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING');
    });

    await test.step('Stop rootless podman machine', async () => {
      await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
      await podmanMachineDetails.podmanMachineStopButton.click();
      await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 50_000 });
    });
  });

  test('Restart default podman machine', async ({ page, navigationBar }) => {
    await test.step('Open resources page', async () => {
      const dashboard = await navigationBar.openDashboard();
      await playExpect(dashboard.heading).toBeVisible();
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    await test.step('Go to default podman machine details page', async () => {
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      const resourcesPodmanConnections = new ResourceConnectionCardPage(
        page,
        RESOURCE_NAME,
        DEFAULT_PODMAN_MACHINE_VISIBLE,
      );
      await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
      await resourcesPodmanConnections.resourceElementDetailsButton.click();
    });

    await test.step('Turn default podman machine on', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);

      await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
      await podmanMachineDetails.podmanMachineStartButton.click();
      await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 50_000 });

      await handleConfirmationDialog(page, 'Podman', true, 'Yes');
      await handleConfirmationDialog(page, 'Podman', true, 'OK');
    });
  });

  test('Clean up rootless podman machine', async ({ page }) => {
    await deletePodmanMachine(page, ROOTLESS_PODMAN_MACHINE_VISIBLE);

    try {
      await handleConfirmationDialog(page, 'Podman', true, 'Yes');
      await handleConfirmationDialog(page, 'Podman', true, 'OK');
    } catch (error) {
      console.log('No handing dialog displayed', error);
    }
  });
});