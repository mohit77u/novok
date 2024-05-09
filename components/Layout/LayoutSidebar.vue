<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { sidebarData, defaultFilterObject, nonSidebarData, defaultResourcesFilterObject } from "~/helper/data";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { mobileSidebar } from "~/store/mobileSidebar";
	import { useAuthStore } from "~/store/auth";
	import { useProfileStore } from "~/store/profile";
	import { usePermissionsStore } from "~/store/permissions";

	const localePath = useLocalePath();
	const config = useRuntimeConfig();
	const store = sidebarItemStore();
	const mobileStore = mobileSidebar();
	const authStore = useAuthStore();
	const permissionsStore = usePermissionsStore();
	const route = useRoute();
	const { t } = useI18n();
	const profileStore = useProfileStore();
	const clientAdminListLoading = ref(false);
	const activeSideBarItem = reactive({
		value: "",
	});
	const myAccountLoading = ref(false);
	const isLoading = ref(true);

	onMounted(async () => {
		if (isMobile.value && !getSideBar.value) {
			store.setSidebarOpen();
		}
		if (!isMobile.value && getSideBar.value) {
			store.setSidebarOpen();
		}

		checkActiveMenu();

		profileStore.setCompanyLogo(profileStore.profileData.user_detail?.company?.company_logo);

		if (authStore.role_id === "client_user") {
			const res: any = await useApiFetch("/access-roles/list/user-permissions", {
				method: "GEt",
			});

			permissionsStore.setPermissions(res?.data?.permissions);
		}

		setTimeout(() => {
			isLoading.value = false;
		}, 1000);
	});

	const checkActiveMenu = () => {
		const findMatchingKeyword = (url: string, keywords: any) => {
			for (const keyword of keywords) {
				if (url.includes(keyword)) {
					return keyword;
				}
			}

			return null;
		};

		const keywords = [
			"client-admins",
			"client-managers",
			"client-users",
			"contact-us-responses",
			"contracts",
			"super-admin",
			"supplier-admins",
			"supplier-users",
			"dashboard",
			"profile",
			"my-company",
			"change-password",
			"client-requests",
			"requests",
			"projects",
			"roles-permissions",
			"supplier-directory",
			"resources",
			"supplier-q-t",
			"q-t",
			"e-auction",
			"app-configurations",
			"signing-entity",
			"custom-fields",
			"spend-tracker",
			"risk-compliance",
			"delegation-authority",
			"supplier-marketplace",
			"reports",
			"privacy-policy",
		];

		const activeItem: String = findMatchingKeyword(route?.fullPath, keywords);

		switch (activeItem) {
			case "super-admin":
				activeSideBarItem.value = "super_users";
				break;
			case "contact-us-responses":
				activeSideBarItem.value = "contactus_responses";
				break;
			case "client-admins":
				activeSideBarItem.value = "client_admins";
				break;
			case "client-managers":
				activeSideBarItem.value = "client_managers";
				break;
			case "client-users":
				activeSideBarItem.value = "client_users";
				break;
			case "supplier-admins":
				activeSideBarItem.value = "suppliers";
				break;
			case "contracts":
				activeSideBarItem.value = "contracts";
				break;
			case "supplier-users":
				activeSideBarItem.value = "supplier_users";
				break;
			case "dashboard":
				activeSideBarItem.value = "dashboard";
				break;
			case "requests":
				activeSideBarItem.value = "requests";
				break;
			case "projects":
				activeSideBarItem.value = "projects";
				break;
			case "profile":
				activeSideBarItem.value = "profile";
				break;
			case "my-company":
				activeSideBarItem.value = "my_company";
				break;
			case "change-password":
				activeSideBarItem.value = "changepassword";
				break;
			case "roles-permissions":
				activeSideBarItem.value = "roles-permissions";
				break;
			case "supplier-directory":
				activeSideBarItem.value = "supplier_directory";
				break;
			case "resources":
				activeSideBarItem.value = "resources";
				break;
			case "q-t":
				activeSideBarItem.value = "q_t";
				break;
			case "supplier-q-t":
				activeSideBarItem.value = "supplier_quotations_tender";
				break;
			case "e-auction":
				activeSideBarItem.value = "e_auction";
				break;
			case "app-configurations":
				activeSideBarItem.value = "app_configurations";
				break;
			case "signing-entity":
				activeSideBarItem.value = "signing_entity";
				break;
			case "custom-fields":
				activeSideBarItem.value = "custom_fields";
				break;
			case "spend-tracker":
				activeSideBarItem.value = "spend_tracker";
				break;
			case "risk-compliance":
				activeSideBarItem.value = "risk_compliance";
				break;
			case "delegation-authority":
				activeSideBarItem.value = "delegation_authority";
				break;
			case "supplier-marketplace":
				activeSideBarItem.value = "supplier_marketplace";
				break;
			case "reports":
				activeSideBarItem.value = "reports";
				break;
			case "client-requests":
				activeSideBarItem.value = "client_requests";
				break;
			case "privacy-policy":
				activeSideBarItem.value = "privacy_policy";
				break;
			default:
				activeSideBarItem.value = "dashboard";
				break;
		}

		store.setActiveSidebarItem(activeSideBarItem.value);
	};

	watchEffect(() => {
		checkActiveMenu();
	});

	const sidebarClick = () => {
		store.setSidebarOpen();
	};

	const getActiveSidebarItem = computed(() => {
		return store.getActiveSidebarItem;
	});

	const getSideBar = computed(() => {
		return store.getSidebarOpen;
	});

	const getRolId = computed(() => {
		return authStore.getRoleId;
	});

	const sidebarItemClick = (url: any, id: any) => {
		activeSideBarItem.value = id;
		store.setActiveSidebarItem(id);
		navigateTo(
			localePath({
				path: url,
			})
		);
		sessionStorage.setItem("pageDetails", JSON.stringify(defaultFilterObject));
		sessionStorage.setItem("resourcePageDetails", JSON.stringify(defaultResourcesFilterObject));
		if(window.screen.width <= 992) {
			store.setSidebarOpen();
        }
	};

	const isMobile = computed(() => {
		if (window.innerWidth < 1200) {
			return true;
		} else {
			return false;
		}
	});

	const getSidebarItems = (id: any) => {
		if (id === "super_users") {
			return getRolId.value === "super_admin";
		} else if (id === "contactus_responses") {
			return getRolId.value === "super_admin";
		} else if (id === "client_requests") {
			return getRolId.value === "super_admin";
		} else if (id === "client_admins") {
			return !!(getRolId.value === "super_user" || getRolId.value === "client_account_manager");
		} else if (id === "client_managers") {
			return getRolId.value === "super_user";
		} else if (id === "client_users") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("clients-user-view-all") || hasPermissionTo("clients-user-view")))
			);
		} else if (id === "suppliers") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("suppliers-admin-view-all") || hasPermissionTo("suppliers-admin-view")))
			);
		} else if (id === "contracts") {
			return (
				getRolId.value === "client_admin" ||
				getRolId.value === "supplier_admin" ||
				getRolId.value === "supplier_user" ||
				(getRolId.value === "client_user" && (hasPermissionTo("contracts-view-all") || hasPermissionTo("contracts-view")))
			);
		} else if (id === "supplier_users") {
			return getRolId.value === "supplier_admin";
		} else if (id === "project_pipeline") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" &&
					(hasPermissionTo("request-view-all") ||
						hasPermissionTo("request-view") ||
						hasPermissionTo("project-view-all") ||
						hasPermissionTo("project-view")))
			);
		} else if (id === "requests") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("request-view-all") || hasPermissionTo("request-view")))
			);
		} else if (id === "projects") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("project-view-all") || hasPermissionTo("project-view")))
			);
		} else if (id === "roles-permissions") {
			return getRolId.value === "client_admin" || (getRolId.value === "client_user" && hasPermissionTo("role-view"));
		} else if (id === "supplier_directory") {
			return getRolId.value !== "super_admin" && getRolId.value !== "supplier_user" && getRolId.value !== "supplier_admin";
		} else if (id === "resources") {
			return getRolId.value === "client_admin" || (getRolId.value === "client_user" && hasPermissionTo("resource-view"));
		} else if (id === "app_configurations") {
			return getRolId.value === "client_admin";
		} else if (id === "signing_entity") {
			return getRolId.value === "client_admin";
		} else if (id === "quotations_tender") {
			return (
				getRolId.value === "client_admin" ||
				getRolId.value === "supplier_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("tender-view-all") || hasPermissionTo("tender-view")))
			);
		} else if (id === "q_t") {
			return (
				getRolId.value === "client_admin" ||
				(getRolId.value === "client_user" && (hasPermissionTo("tender-view-all") || hasPermissionTo("tender-view")))
			);
		} else if (id === "supplier_quotations_tender") {
			return getRolId.value === "supplier_admin";
		} else if (id === "e_auction") {
			return getRolId.value === "client_admin" || getRolId.value === "client_user";
		} else if (id === "spend_tracker") {
			return getRolId.value === "client_admin" || getRolId.value === "client_user";
		} else if (id === "risk_compliance") {
			return getRolId.value === "client_admin" || getRolId.value === "client_user";
		} else if (id === "reports") {
			return getRolId.value === "client_admin" || getRolId.value === "client_user";
		}

		return true;
	};

	const redirectDashboard = () => {
		navigateTo(
			localePath({
				path: "/dashboard",
			})
		);
	};
</script>

<template>
	<div class="fixed top-0 left-0 lg:top-4 bottom-0 lg:bottom-4 app-sidebar xl:z-10 flex flex-col group" @mouseenter="sidebarClick" @mouseleave.prevent="sidebarClick">
		<div class="app-sidebar-logo flex items-center border-b border-b-white/20 py-4">
			<NuxtImg
				v-if="getSideBar"
				src="/images/logo-white.svg"
				alt="logo"
				class="h-10 sidebar-logo cursor-pointer"
				@click.prevent="redirectDashboard"
			/>

			<NuxtImg format="webp" v-else-if="!getSideBar" class="cursor-pointer" src="/images/smlogo.webp" alt="logo" @click.prevent="redirectDashboard" />

			<div
				class="flex items-center justify-center rounded-full text-xs w-6 h-6 shadow-md text-primary cursor-pointer absolute right-0 bg-white border-2 border-primary translate-x-1/2"
			>
				<i class="fa-solid" :class="getSideBar ? 'fa-angles-right' : 'fa-angles-left'"></i>
			</div>
		</div>
		<el-skeleton v-if="isLoading" animated class="grid grid-flow-row gap-4 px-4 mt-4">
			<template #template>
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
				<el-skeleton-item variant="h3" style="width: 100%; height: 40px" class="opacity-20 rounded-full" />
			</template>
		</el-skeleton>
		<div class="overflow-hidden" v-else>
			<div class="pl-2 py-5 mainMenu h-full overflow-y-scroll" dir="rtl">
				<div class="h-full">
					<el-menu
						:unique-opened="true"
						:default-active="getActiveSidebarItem ? getActiveSidebarItem : '1'"
						class="el-menu-vertical-demo w-full flex flex-col border-r-0"
					>
						<!-- Dashboard -->
						<novok-menu-item
							v-if="getSidebarItems('dashboard')"
							:label="$t('header.dashboard')"
							icon="fa-fw fa-solid fa-grid"
							@click="sidebarItemClick('/dashboard', 'dashboard')"
							:is-active="activeSideBarItem.value === 'dashboard'"
						/>

						<!-- Project pipeline -->
						<el-sub-menu :unique-opened="true" dir="ltr" index="project_pipeline" v-if="getSidebarItems('requests') || getSidebarItems('projects')">
							<template #title>
								<el-tooltip effect="dark" :content="$t('header.project_pipeline')" placement="top" :show-after="1000" :hide-after="10">
									<div class="inline-flex items-center">
										<i class="fa-fw flex fa-solid fa-rectangle-vertical-history items-center"></i>
										<span class="ml-3 sidebarTitle truncate">{{ $t("header.project_pipeline") }}</span>
									</div>
								</el-tooltip>
							</template>
							<el-menu-item-group>
								<!-- requests -->
								<novok-menu-item
									v-if="getSidebarItems('requests')"
									:label="$t('header.requests')"
									icon="fa-solid fa-file-signature"
									@click="sidebarItemClick('/project-pipeline/requests', 'requests')"
									:is-active="activeSideBarItem.value === 'requests'"
									class="!pl-[20px]"
								/>

								<!-- project -->
								<novok-menu-item
									v-if="getSidebarItems('projects')"
									:label="$t('header.projects')"
									icon="fa-solid fa-file-waveform"
									@click="sidebarItemClick('/project-pipeline/projects', 'projects')"
									:is-active="activeSideBarItem.value === 'projects'"
									class="!pl-[20px]"
								/>
							</el-menu-item-group>
						</el-sub-menu>

						<!-- Quotations Tender -->
						<el-sub-menu dir="ltr" index="quotations_tender" v-if="getSidebarItems('quotations_tender')">
							<template #title>
								<el-tooltip effect="dark" :content="$t('header.quotations_tender')" placement="top" :show-after="1000" :hide-after="10">
									<div class="inline-flex items-center">
										<i class="fa-solid fa-fw fa-file-invoice-dollar"></i>
										<span class="ml-3 sidebarTitle truncate">{{ $t("header.quotations_tender") }}</span>
									</div>
								</el-tooltip>
							</template>
							<el-menu-item-group>
								<!-- q_n_t -->
								<novok-menu-item
									v-if="getSidebarItems('q_t')"
									:label="$t('header.q_n_t')"
									icon="fa-solid fa-file-word"
									:is-show-coming="false"
									@click="sidebarItemClick('/quotations-tender/q-t', 'q_t')"
									:is-active="activeSideBarItem.value === 'q_t'"
									class="!pl-[20px]"
								/>

								<!-- supplier_q_n_t -->
								<novok-menu-item
									v-if="getSidebarItems('supplier_quotations_tender')"
									:label="$t('header.supplier_quotations_tender')"
									icon="fa-solid fa-file-word"
									:is-show-coming="false"
									@click="sidebarItemClick('/quotations-tender/supplier-q-t', 'supplier_quotations_tender')"
									:is-active="activeSideBarItem.value === 'supplier_quotations_tender'"
									class="!pl-[20px]"
								/>

								<!-- e_auction -->
								<!-- <novok-menu-item
									v-if="getSidebarItems('e_auction')"
									:label="$t('header.e_auction')"
									icon="fa-solid fa-file-check"
									:is-show-coming="true"
									@click="sidebarItemClick('/quotations-tender/e-auction', 'e_auction')"
									:is-active="activeSideBarItem.value === 'e_auction'"
									class="!pl-[20px]"
								/> -->
							</el-menu-item-group>
						</el-sub-menu>

						<!-- Suppliers -->
						<el-sub-menu dir="ltr" index="suppliers" v-if="getSidebarItems('suppliers') || getSidebarItems('supplier_directory')">
							<template #title>
								<el-tooltip effect="dark" :content="$t('header.suppliers')" placement="top" :show-after="1000" :hide-after="10">
									<div class="inline-flex items-center">
										<i class="fa-solid fa-fw fa-truck-arrow-right"></i>
										<span class="ml-3 sidebarTitle truncate">{{ $t("header.suppliers") }}</span>
									</div>
								</el-tooltip>
							</template>
							<el-menu-item-group>
								<!-- Suppliers -->
								<novok-menu-item
									v-if="getSidebarItems('suppliers')"
									:label="$t('header.my_suppliers')"
									icon="fa-solid fa-truck-fast"
									@click="sidebarItemClick('/supplier-admins', 'suppliers')"
									:is-active="activeSideBarItem.value === 'suppliers' || activeSideBarItem.value === 'supplier_users'"
								/>

								<!-- risk_compliance -->
								<!-- <novok-menu-item
									v-if="getSidebarItems('risk_compliance')"
									:label="$t('header.risk_compliance')"
									icon="fa-solid fa-sensor-triangle-exclamation"
									:is-show-coming="true"
									@click="sidebarItemClick('/risk-compliance', 'risk_compliance')"
									:is-active="activeSideBarItem.value === 'risk_compliance'"
								/> -->

								<!-- Supplier Directory -->
								<novok-menu-item
									v-if="getSidebarItems('supplier_directory')"
									:label="$t('header.supplier_directory')"
									icon="fa-solid fa-address-book"
									:is-show-coming="false"
									@click="sidebarItemClick('/supplier-directory', 'supplier_directory')"
									:is-active="activeSideBarItem.value === 'supplier_directory'"
								/>
							</el-menu-item-group>
						</el-sub-menu>

						<!-- supplier users -->
						<novok-menu-item
							v-if="getSidebarItems('supplier_users')"
							:label="$t('header.supplier_users')"
							icon="fa-solid fa-truck-arrow-right"
							@click="sidebarItemClick('/supplier-users', 'supplier_users')"
							:is-active="activeSideBarItem.value === 'supplier_users'"
						/>

						<!-- Contracts -->
						<novok-menu-item
							v-if="getSidebarItems('contracts')"
							:label="$t('header.contracts')"
							icon="fa-solid fa-file-contract"
							@click="sidebarItemClick('/contracts', 'contracts')"
							:is-active="activeSideBarItem.value === 'contracts'"
						/>

						<!-- Resources -->
						<novok-menu-item
							v-if="getSidebarItems('resources')"
							:label="$t('header.resources')"
							icon="fa-solid fa-folder-open"
							@click="sidebarItemClick('/resources', 'resources')"
							:is-active="activeSideBarItem.value === 'resources'"
						/>

						<!-- Spend Tracker -->
						<novok-menu-item
							v-if="getSidebarItems('spend_tracker') && authStore.role_id == 'client_admin'"
							:label="$t('header.spend_tracker')"
							icon="fa-solid fa-chart-gantt"
							:is-show-coming="false"
							@click="sidebarItemClick('/spend-tracker', 'spend_tracker')"
							:is-active="activeSideBarItem.value === 'spend_tracker'"
						/>

						<!-- Super User -->
						<novok-menu-item
							v-if="getSidebarItems('super_users')"
							:label="$t('header.super_users')"
							icon="fa-fw fa-sharp fa-solid fa-user-secret"
							@click="sidebarItemClick('/super-admin', 'super_users')"
							:is-active="activeSideBarItem.value === 'super_users'"
						/>

						<!-- bs client requests -->
						<novok-menu-item
							v-if="getSidebarItems('client_requests')"
							:label="$t('header.client_requests')"
							icon="fa-solid fa-users"
							@click="sidebarItemClick('/client-requests', 'client_requests')"
							:is-active="activeSideBarItem.value === 'client_requests'"
						/>

						<!-- contact us responses -->
						<novok-menu-item
							v-if="getSidebarItems('contactus_responses')"
							:label="$t('header.contactus_responses')"
							icon="fa-fw fa-solid fa-address-card"
							@click="sidebarItemClick('/contact-us-responses', 'contactus_responses')"
							:is-active="activeSideBarItem.value === 'contactus_responses'"
						/>

						<!-- client admins -->
						<novok-menu-item
							v-if="getSidebarItems('client_admins')"
							:label="$t('header.client_admins')"
							icon="fa-fw fa-solid fa-user-shield"
							@click="sidebarItemClick('/client-admins', 'client_admins')"
							:is-active="activeSideBarItem.value === 'client_admins'"
						/>

						<!-- client admins -->
						<novok-menu-item
							v-if="getSidebarItems('client_managers')"
							:label="$t('header.client_managers')"
							icon="fa-fw fa-solid fa-user-gear"
							@click="sidebarItemClick('/client-managers', 'client_managers')"
							:is-active="activeSideBarItem.value === 'client_managers'"
						/>

						<!-- Supplier Directory -->
						<novok-menu-item
							v-if="authStore.role_id == 'super_admin'"
							:label="$t('header.supplier_directory')"
							icon="fa-solid fa-address-book"
							@click="sidebarItemClick('/supplier-directory', 'supplier_directory')"
							:is-active="activeSideBarItem.value === 'supplier_directory'"
						/>

						<!-- Settings -->
						<el-sub-menu dir="ltr" index="settings" v-if="getSidebarItems('app_configurations') && authStore.role_id == 'client_admin'">
							<template #title>
								<el-tooltip effect="dark" :content="$t('header.settings')" placement="top" :show-after="1000" :hide-after="10">
									<div class="inline-flex items-center">
										<i class="fa-fw flex fa-solid fa-gear items-center"></i>
										<span class="ml-3 sidebarTitle truncate">{{ $t("header.settings") }}</span>
									</div>
								</el-tooltip>
							</template>
							<el-menu-item-group>
								<!-- client users -->
								<novok-menu-item
									v-if="getSidebarItems('client_users')"
									:label="$t('header.client_users')"
									icon="fa-fw fa-solid fa-user-tie"
									@click="sidebarItemClick('/client-users', 'client_users')"
									:is-active="activeSideBarItem.value === 'client_users'"
								/>

								<!-- Roles Permissions -->
								<novok-menu-item
									v-if="getSidebarItems('roles-permissions')"
									:label="$t('header.permissions')"
									icon="fa-solid fa-user-unlock"
									@click="sidebarItemClick('/roles-permissions', 'roles-permissions')"
									:is-active="activeSideBarItem.value === 'roles-permissions'"
								/>

								<!-- app_configurations -->
								<novok-menu-item
									v-if="getSidebarItems('app_configurations')"
									:label="$t('header.configurations')"
									icon="fa-solid fa-sliders"
									@click="sidebarItemClick('/settings/app-configurations', 'app_configurations')"
									:is-active="activeSideBarItem.value === 'app_configurations'"
									class="!pl-[20px]"
								/>

								<!-- signing_entity -->
								<novok-menu-item
									v-if="getSidebarItems('signing_entity')"
									:label="$t('header.signing_entity')"
									icon="fa-solid fa-right-to-bracket"
									@click="sidebarItemClick('/signing-entity', 'signing_entity')"
									:is-active="activeSideBarItem.value === 'signing_entity'"
									class="!pl-[20px]"
								/>

								<!-- custom fields -->
								<novok-menu-item
									v-if="getSidebarItems('custom_fields')"
									:label="$t('header.custom_fields')"
									icon="fa-solid fa-input-text"
									@click="sidebarItemClick('/settings/custom-fields', 'custom_fields')"
									:is-active="activeSideBarItem.value === 'custom_fields'"
									class="!pl-[20px]"
								/>
							</el-menu-item-group>
						</el-sub-menu>

						<!-- Reports -->
						<!-- <novok-menu-item
							v-if="getSidebarItems('reports')"
							:label="$t('header.reports')"
							icon="fa-solid fa-chart-simple"
							@click="sidebarItemClick('/reports', 'reports')"
							:is-show-coming="true"
							:is-active="activeSideBarItem.value === 'reports'"
						/> -->
					</el-menu>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="css" scoped>
	.name-logo {
		@apply font-bold text-4xl text-white h-full w-full flex items-center justify-center cursor-pointer;
	}

	.custom-dropdown-placement .el-dropdown-link {
		@apply w-[244px];
	}
	.el-skeleton {
		--el-skeleton-color: rgba(255, 255, 255, 0.5);
		--el-skeleton-to-color: rgba(255, 255, 255, 0.7);
	}
</style>
