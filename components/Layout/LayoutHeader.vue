<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { sidebarItemStore } from "../../store/sidebarItem";
	import { useAuthStore } from "../../store/auth";
	import { useProfileStore } from "~/store/profile";
	import { mobileSidebar } from "~/store/mobileSidebar";
	import { sidebarData, nonSidebarData } from "~/helper/data";

	const localePath = useLocalePath();
	const store = sidebarItemStore();
	const profileStore = useProfileStore();
	const authStore = useAuthStore();
	// const sidebarOpen = ref(false);
	const mobileStore = mobileSidebar();
	const { submit } = useSelectAccount();
	const language = ref<any>({
		label: "English",
		code: "en",
	});
	const accountListLoading = ref(false);
	const myAccountLoading = ref(false);
	const config = useRuntimeConfig();
	const { t } = useI18n();

	const emit = defineEmits(["sidebarOpen"]);

	const getLanguage = computed(() => {
		return authStore.getLanguage;
	});

	onMounted(() => {
		language.value = getLanguage?.value;
	});

	const isAccessAsClientAdmin = computed(() => {
		return authStore.role_id === "client_admin" && authStore.role_id !== profileStore.getAuthUserRoleId;
	});

	const getSidebarActiveItem = computed(() => {
		let index = "";
		const data = sidebarData.find((item) => {
			index = item.index;
			return item.index === store.getSidebarItem;
		});

		if (index === store.getSidebarItem) {
			return data;
		} else if (store.getSidebarItem.includes("-")) {
			return getChildSidebarData();
		} else {
			return getNonSidebarData();
		}
	});

	const getNonSidebarData = () => {
		const data = nonSidebarData.find((item) => {
			return item.index === store.getSidebarItem;
		});

		return data;
	};

	const getChildSidebarData = () => {
		const data: any = sidebarData.find((item: any) => {
			return item?.children;
		});

		const items = data?.children?.find((item: any) => {
			return item?.index === store.getSidebarItem;
		});
		return items;
	};

	const getProfileData = computed(() => {
		return profileStore.getProfileData;
	});

	const getActiveSidebarItem = computed(() => {
		return store.getActiveSidebarItem;
	});

	const headerTitle = computed(() => {
		const data = prepareTitleIcon(getActiveSidebarItem.value);
		return data.title;
	});

	const headerIcon = computed(() => {
		const data = prepareTitleIcon(getActiveSidebarItem.value);
		return data.icon;
	});

	const prepareTitleIcon = (value: any) => {
		let data = {
			title: "",
			icon: "",
		};

		switch (value) {
			case "dashboard":
				data.title = t("header.dashboard");
				data.icon = "fa-fw fa-solid fa-grid";
				break;
			case "super_users":
				data.title = t("header.super_users");
				data.icon = "fa-fw fa-sharp fa-solid fa-user-secret";
				break;
			case "contactus_responses":
				data.title = t("header.contactus_responses");
				data.icon = "fa-fw fa-solid fa-address-card";
				break;
			case "client_managers":
				data.title = t("header.client_managers");
				data.icon = "fa-fw fa-solid fa-user-gear";
				break;
			case "client_admins":
				data.title = t("header.client_admins");
				data.icon = "fa-fw fa-solid fa-user-shield";
				break;
			case "client_users":
				data.title = t("header.client_users");
				data.icon = "fa-fw fa-solid fa-user-tie";
				break;
			case "profile":
				data.title = t("header.profile");
				data.icon = "fa-fw fa-regular fa-user";
				break;
			case "changepassword":
				data.title = t("header.changepassword");
				data.icon = "fa-regular fa-fw fa-lock-keyhole";
				break;
			case "my_company":
				data.title = t("header.my_company");
				data.icon = "fa-regular fa-fw fa-building-user";
				break;
			case "suppliers":
				data.title = t("header.suppliers");
				data.icon = "fa-solid fa-truck-fast";
				break;
			case "contracts":
				data.title = t("header.contracts");
				data.icon = "fa-solid fa-file-contract";
				break;
			case "supplier_users":
				data.title = t("header.supplier_users");
				data.icon = "fa-solid fa-truck-arrow-right";
				break;
			case "requests":
				data.title = t("header.requests");
				data.icon = "fa-solid fa-file-signature";
				break;
			case "projects":
				data.title = t("header.projects");
				data.icon = "fa-solid fa-file-waveform";
				break;
			case "roles-permissions":
				data.title = t("header.roles_and_permissions");
				data.icon = "fa-solid fa-user-unlock";
				break;
			case "supplier_directory":
				data.title = t("header.supplier_directory");
				data.icon = "fa-solid fa-address-book";
				break;
			case "resources":
				data.title = t("header.resources");
				data.icon = "fa-solid fa-folder-open";
				break;
			case "q_t":
				data.title = t("header.q_n_t");
				data.icon = "fa-solid fa-file-word";
				break;
			case "supplier_quotations_tender":
				data.title = t("header.supplier_quotations_tender");
				data.icon = "fa-solid fa-file-word";
				break;
			case "e_auction":
				data.title = t("header.e_auction");
				data.icon = "fa-solid fa-file-check";
				break;
			case "app_configurations":
				data.title = t("header.app_configurations");
				data.icon = "fa-solid fa-sliders";
				break;
			case "custom_fields":
				data.title = t("header.custom_fields");
				data.icon = "fa-solid fa-input-text";
				break;
			case "signing_entity":
				data.title = t("header.signing_entity");
				data.icon = "fa-solid fa-right-to-bracket";
				break;
			case "spend_tracker":
				data.title = t("header.spend_tracker");
				data.icon = "fa-solid fa-chart-gantt";
				break;
			case "risk_compliance":
				data.title = t("header.risk_compliance");
				data.icon = "fa-solid fa-sensor-triangle-exclamation";
				break;
			case "delegation_authority":
				data.title = t("header.delegation_authority");
				data.icon = "fa-fw fa-solid fa-user-unlock";
				break;
			case "supplier_marketplace":
				data.title = t("header.supplier_directory");
				data.icon = "fa-solid fa-address-book";
				break;
			case "reports":
				data.title = t("header.reports");
				data.icon = "fa-solid fa-chart-simple";
				break;
			case "client_requests":
				data.title = t("header.client_requests");
				data.icon = "fa-solid fa-users";
				break;
			case "privacy_policy":
				data.title = t("header.privacy_policy");
				data.icon = "fa-solid fa-file-shield";
				break;
			default:
				data.title = t("header.dashboard");
				data.icon = "fa-fw fa-solid fa-grid";
				break;
		}

		return data;
	};

	const sidebarClick = () => {
		//   sidebarOpen.value = !sidebarOpen.value;
		//   const storee: any = store.$state.sidebarOpen;
		store.setSidebarOpen();
		//   mobileStore.setMobileSidebar(storee);
		//   emit("sidebarOpen", storee);
	};

	const languageClick = (value: any) => {
		if (value === "es") {
			language.value.label = "Spanish";
			language.value.code = "es";
			authStore.setLanguage(language.value);
		} else if (value === "pt") {
			language.value.label = "Portuguese";
			language.value.code = "pt";
			authStore.setLanguage(language.value);
		} else {
			language.value.label = "English";
			language.value.code = "en";
			authStore.setLanguage(language.value);
		}
	};

	const switchAccount = async (id: number) => {
		await submit(id, "header");
		// store.setSidebarItem("1"); // 1-dashboard
		// store.setActiveSidebarItem("1");
		navigateTo(localePath("/account-switch"));
	};

	const handleAccountChangeClick = async (visible: any) => {
		if (visible) {
			try {
				accountListLoading.value = true;

				const res: any = await useApiFetch(`/select/account-list`, {
					method: "GET",
				});

				authStore.setAccountsList(res.data);
			} catch {
			} finally {
				accountListLoading.value = false;
			}
		}
	};

	const backToMyAccount = async () => {
		const role_id = useCookie("role_id");
		role_id.value = profileStore.profileData.user_detail?.role_id;
		authStore.setRoleId(profileStore.profileData.user_detail?.role_id);
		sessionStorage.removeItem("client_admin_id");
		profileStore.setCompanyLogo(profileStore.profileData.user_detail?.company?.company_logo);
		navigateTo(localePath("/account-switch"));
	};

	const logout = async () => {
		myAccountLoading.value = true;
		try {
			await useApiFetch("/logout", {
				method: "POST",
			});

			await authLogout();
			myAccountLoading.value = false;
		} catch (error) {
			myAccountLoading.value = false;
		}
	};

	const fillMoreDetails = () => {
		const tenant_supplier_id = useCookie("tenant_supplier_id");
		navigateTo(localePath(`/supplier-admins/edit-supplier-admin/${tenant_supplier_id.value}`));
	};

	const changePassword = () => {
		navigateTo(localePath("/change-password"));
	};

	const isActiveDelegatedUser = computed(() => {
		// is_delegated 1 means active
		return profileStore.profileData?.user_detail?.is_delegated === 1;
	});

	const accessDelegatedAccount = async (row: any) => {
		try {
			const res: any = await useApiFetch(`/delegated-user-layout`, {
				method: "POST",
				body: {},
			});

			sessionStorage.setItem("client_admin_id", res?.data?.delegated_user_id);
			authStore.setRoleId(res?.data?.role_id);
			useToast("success", res?.message);
			navigateTo(localePath("/account-switch"));
		} catch {}
	};

	const accessMyAccount = async (row: any) => {
		try {
			const res: any = await useApiFetch(`/exit-delegated-user-layout`, {
				method: "POST",
				body: {},
			});

			sessionStorage.setItem("client_admin_id", res?.data?.delegated_user_id);
			authStore.setRoleId(res?.data?.role_id);

			useToast("success", res?.message);

			navigateTo(localePath("/account-switch"));
		} catch {}
	};

	const isAccessDelegatedUser = computed(() => {
		// is_delegated 2 means access
		return profileStore.profileData?.user_detail?.is_delegated === 2;
	});

	const showCompany = computed(() => {
		if (authStore.getRoleId === "super_user" || authStore.getRoleId === "client_admin" || authStore.getRoleId === "supplier_admin") {
			return true;
		} else {
			return false;
		}
	});

	const profileClick = () => {
		navigateTo(localePath("/profile"));
	};

	const companyClick = () => {
		navigateTo(localePath("/my-company"));
	};

	const companyLogo = computed(() => {
		return profileStore.companyLogoUrl;
	});

	const firstCharacterOfCompany = computed(() => (profileStore?.getCompanyDetails?.company_name || "").charAt(0).toUpperCase());

	watch(
		() => profileStore,
		(value: any) => {},

		{ deep: true, immediate: true }
	);

	const privacyPolicyClick = () => {
		navigateTo(localePath("privacy-policy"));
	};
</script>

<template>
	<div
		class="header lg:top-4 lg:right-4 right-0 bg-[#fff] px-4 z-10 grow items-stretch flex lg:rounded-t-3xl border-b lg:border-b-0 border-b-neutral-200"
	>
		<div class="md:border-b border-b-neutral-200 w-full items-stretch flex pl-1">
			<div class="flex items-center lg:hidden">
				<NuxtImg format="webp" class="h-9 cursor-pointer" src="/images/smlogo.webp" alt="logo" />
				<div class="ml-3 py-2 px-3 cursor-pointer rounded-md hover:bg-primary/20" @click="sidebarClick">
					<i class="fa-solid fa-bars-sort"></i>
				</div>
			</div>
			<div class="hidden xl:flex items-center gap-2">
				<i :class="headerIcon" class="fa-fw text-dark text-xl"></i>
				<div class="text-2xl font-bold items-center text-dark">
					{{ headerTitle }}
				</div>
			</div>
			<div class="app-navbar flex items-center shrink-0 pl-6 ml-auto text-base">
				<!-- account select list dropdown -->
				<div v-if="authStore.accountsList.length > 1 && !isAccessAsClientAdmin" class="flex items-center">
					<el-dropdown
						@visible-change="handleAccountChangeClick"
						class="ml-6 pl-6 border-r-2 border-gray-200"
						trigger="click"
						placement="bottom-end"
					>
						<div class="flex items-center">
							<NuxtImg
								v-if="getProfileData?.user_detail?.company?.company_logo"
								:src="getProfileData?.user_detail?.company?.company_logo"
								class="h-10 rounded-md"
								alt="frenchLogo"
							/>
							<NuxtImg v-else :src="config.public.default_user_link" class="w-10 h-10 rounded-md object-cover" alt="profile" />
							<div class="ml-4 hidden lg:block">
								<span class="block text-dark font-bold leading-none">{{ getProfileData?.user_detail?.company?.company_name }}</span>
								<span class="block text-dark/60 mt-1 leading-none">{{ getProfileData?.user_detail?.role_name }}</span>
							</div>

							<el-icon class="el-icon--right hidden ml-3 lg:block">
								<i class="fa-regular fa-angle-down"></i>
							</el-icon>
						</div>

						<template #dropdown>
							<el-dropdown-menu v-loading="accountListLoading">
								<el-dropdown-item v-for="account in authStore.accountsList" :key="account.id">
									<div @click="switchAccount(account?.id)">
										<div class="flex items-center">
											<NuxtImg
												v-if="account?.company_logo"
												:src="account?.company_logo"
												class="w-8 h-8 rounded-md"
												alt="englishLogo"
											/>
											<NuxtImg
												v-else
												:src="config.public.default_user_link"
												class="w-10 h-10 rounded-md object-cover"
												alt="profile"
											/>

											<div class="ml-4">
												<span class="block text-dark font-bold leading-none">{{ account?.company_name }} </span>
												<span class="block text-dark/60 mt-1 leading-none">{{ account?.role_name }}</span>
											</div>
										</div>
									</div>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>

				<!-- company logo -->
				<div class="company-logo flex items-center gap-3" v-else-if="companyLogo">
					<span class="text-primary font-bold" v-if="getProfileData?.user_detail?.company?.company_name">{{
						getProfileData?.user_detail?.company?.company_name
					}}</span>
					<NuxtImg v-if="companyLogo" :src="companyLogo" alt="logo" class="h-10" />
				</div>

				<!-- user dropdown -->
				<div class="sidebar-footer relative">
					<div v-if="isAccessAsClientAdmin" @click="backToMyAccount()" class="flex cursor-pointer items-center ml-4 rounded-lg">
						<div class="flex items-center justify-center gap-2">
							<i class="fa-solid fa-arrow-left text-md"></i>
							<span class="font-bold text-lg truncate">My Account</span>
						</div>
					</div>

					<el-dropdown
						v-else
						trigger="click"
						placement="bottom-end"
						max-height="410"
						popper-class="w-[244px] max-h-[410px] sidebarLogin mr-2"
						class="w-full ml-4 pl-2 xl:pl-0"
						:hide-on-click="true"
					>
						<div class="flex items-center w-full rounded-lg">
							<NuxtImg
								v-if="getProfileData?.user_detail?.profile_picture"
								:src="getProfileData?.user_detail?.profile_picture"
								class="w-10 h-10 rounded-full object-cover border-2 border-primary"
								alt="profile"
							/>
							<NuxtImg format="webp" v-else src="images/user.webp" class="w-10 h-10 rounded-md object-cover" alt="profile" />
						</div>

						<template #dropdown>
							<div class="profile-details px-3 pt-4 pb-2 flex">
								<NuxtImg
									v-if="getProfileData?.user_detail?.profile_picture"
									:src="getProfileData?.user_detail?.profile_picture"
									class="w-10 h-10 rounded-full object-cover mr-3"
									alt="profile"
								/>
								<div class="overflow-hidden">
									<p class="leading-none mb-1 w-full truncate block font-bold text-lg text-white">
										{{ getProfileData?.user_detail?.full_name || "" }}
									</p>
									<p class="leading-none text-sm text-white">{{ getProfileData?.user_detail?.job_title || "" }}</p>
								</div>
							</div>
							<el-dropdown-menu>
								<el-dropdown-item @click="profileClick">
									<i class="fa-regular fa-fw fa-user"></i>{{ $t("dropdown_labels.my_profile") }}
								</el-dropdown-item>

								<el-dropdown-item v-if="showCompany" @click="companyClick">
									<i class="fa-regular fa-fw fa-building-user"></i>{{ $t("dropdown_labels.my_company") }}
								</el-dropdown-item>

								<el-dropdown-item v-if="authStore.role_id == 'supplier_admin'" @click="fillMoreDetails"
									><i class="fa-regular fa-fw fa-pencil"></i>{{ $t("dropdown_labels.fill_more_details") }}</el-dropdown-item
								>

								<el-dropdown-item @click="changePassword"
									><i class="fa-regular fa-fw fa-lock-keyhole"></i>{{ $t("dropdown_labels.change_password") }}</el-dropdown-item
								>

								<el-dropdown-item class="!p-0">
									<el-dropdown placement="left-start" popper-class="sidebarLogin">
										<span class="el-dropdown-link flex items-center leading-[22px] !p-3">
											<i class="fa-fw fa-solid fa-language"></i>

											<span>{{ getLanguage.label }}</span>
											<i class="fa-fw fa-solid fa-chevron-right !mr-0 ml-auto"></i>
										</span>

										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item>
													<div @click="languageClick('en')">
														<nuxt-link class="flex items-center" :to="switchLocalePath('en')">
															<NuxtImg
																format="webp"
																src="/images/english.webp"
																class="w-6 h-6 rounded-md"
																alt="englishLogo"
															/>
															<div class="ml-4">
																<span class="block">English</span>
															</div>
														</nuxt-link>
													</div>
												</el-dropdown-item>
												<el-dropdown-item>
													<div @click="languageClick('es')">
														<nuxt-link class="flex items-center" :to="switchLocalePath('es')">
															<NuxtImg
																format="webp"
																src="/images/spanish.webp"
																class="w-6 h-6 rounded-md"
																alt="frenchLogo"
															/>
															<div class="ml-4">
																<span class="block">Spanish</span>
															</div>
														</nuxt-link>
													</div>
												</el-dropdown-item>
												<el-dropdown-item>
													<div @click="languageClick('pt')">
														<nuxt-link class="flex items-center" :to="switchLocalePath('pt')">
															<NuxtImg
																format="webp"
																src="/images/Portuguese.webp"
																class="w-6 h-6 rounded-md"
																alt="frenchLogo"
															/>
															<div class="ml-4">
																<span class="block">Portuguese</span>
															</div>
														</nuxt-link>
													</div>
												</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</el-dropdown-item>

								<el-dropdown-item v-if="isActiveDelegatedUser" @click="accessDelegatedAccount">
									<i class="fa-fw fa-solid fa-screen-users"></i>{{ $t("dropdown_labels.access_delegated_account") }}
								</el-dropdown-item>

								<el-dropdown-item v-if="isAccessDelegatedUser" @click="accessMyAccount">
									<i class="fa-fw fa-solid fa-id-card-clip"></i>{{ $t("dropdown_labels.access_my_account") }}
								</el-dropdown-item>

								<el-dropdown-item
									v-if="!isAccessDelegatedUser && (authStore.role_id === 'client_admin' || authStore.role_id === 'client_user')"
									@click="navigateTo(localePath('/delegation-authority'))"
								>
									<i class="fa-fw fa-solid fa-user-unlock"></i>{{ $t("dropdown_labels.assign_delegation_authority") }}
								</el-dropdown-item>

								<el-dropdown-item class="!p-0">
									<el-dropdown placement="left-start" popper-class="sidebarLogin">
										<span class="el-dropdown-link flex items-center leading-[22px] !p-3">
											<i class="fa-regular fa-fw fa-file-invoice"></i>
											<span>{{ $t("dropdown_labels.documents.documents") }}</span>
											<i class="fa-fw fa-solid fa-chevron-right !mr-0 ml-auto"></i>
										</span>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item>
													<a href="/privacy-policy" target="_blank">{{
														$t("dropdown_labels.documents.privacy_policy")
													}}</a></el-dropdown-item
												>
												<el-dropdown-item>{{ $t("dropdown_labels.documents.gdpr") }}</el-dropdown-item>
												<el-dropdown-item>{{ $t("dropdown_labels.documents.data_protection") }}</el-dropdown-item>
												<el-dropdown-item>
													<a :href="config.public.modern_slavery" target="_blank">{{
														$t("dropdown_labels.documents.modern_slavery")
													}}</a></el-dropdown-item
												>
												<el-dropdown-item>{{ $t("dropdown_labels.documents.media_updates") }}</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</el-dropdown-item>

								<el-dropdown-item @click="logout"
									><i class="fa-regular fa-fw fa-arrow-up-left-from-circle"></i>
									{{ $t("dropdown_labels.sign_out") }}
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
		</div>
	</div>
</template>


