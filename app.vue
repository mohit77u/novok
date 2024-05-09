<script setup lang="ts">
	import { useAuthStore } from "./store/auth";
	import { useProfileStore } from "./store/profile";
	import { usePermissionsStore } from "./store/permissions";

	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const permissionsStore = usePermissionsStore();
	const router = useRouter();
	const localePath = useLocalePath();
	const switchLocalePath = useSwitchLocalePath();

	onMounted(async () => {
		const { locale } = useI18n();
		const language = {
			label: locale.value === "es" ? "Spanish" : locale.value === "pt" ? "Portuguese" : "English",
			code: locale.value,
		};
		authStore.setLanguage(language);

		const currentLanguage = authStore.getLanguage;

		navigateTo(switchLocalePath(currentLanguage?.code || "en"));

		const authToken = useCookie("auth_token");

		if (authToken.value == undefined) {
			// router.push(localePath("/sign-in"));
			return true;
		}

		const isMFA = useCookie("is_mfa");
		// if (!isMFA.value) {
		// 	router.push(localePath("/sign-in"));
		// }

		try {
			const res: any = await useApiFetch("/profile", {
				method: "GET",
			});
			authStore.setNextScreen("dashboard");
			authStore.setRoleId(res.data?.user?.user_detail?.role_id);
			profileStore.setMFAvalue(res.data?.user?.is_mfa === 1);
			const clientAdminId = sessionStorage.getItem("client_admin_id");
			profileStore.setProfile(res.data?.user);

			if ((authStore.role_id === "super_user" || authStore.role_id === "client_account_manager") && clientAdminId) {
				// Set role id of client admin
				authStore.setRoleId(4);
				sessionStorage.setItem("client_admin_id", clientAdminId);
			}

			if (authStore.role_id === "client_user") {
				const res: any = await useApiFetch("/access-roles/list/user-permissions", {
					method: "GEt",
				});

				permissionsStore.setPermissions(res?.data?.permissions);
			}

			const resAccount: any = await useApiFetch(`/select/account-list`, {
				method: "GET",
			});

			authStore.setAccountsList(resAccount.data);
		} catch (error) {
			await authLogout();
		}

        const chatScript = document.createElement("script");
        chatScript.type = "text/javascript";
        chatScript.innerHTML = `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/65dc4b249131ed19d971a54d/1hni8b23d';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
        `;

        document.body.appendChild(chatScript);
	});
</script>
<template>
	<div>
		<VitePwaManifest />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>
