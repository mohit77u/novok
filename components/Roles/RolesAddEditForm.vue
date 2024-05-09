<script setup lang="ts">
	import { required, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	// import { modulePermissions } from "~/helper/data";

	const props = defineProps({
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const localePath = useLocalePath();
	const { t } = useI18n();

	const fullscreenLoading = ref(false);
	const tableData = ref<any>([]);
	const checkAll = ref(false);
	const isIndeterminate = ref(true);
	const route = useRoute();

	const formData = reactive<any>({
		name: "",
		slug: "",
		permissions: [],
	});
	const clients = ref(["Create", "Edit", "Delete", "View"]);
	const checkedData = ref<any>([]);
	const getPermissions = ref<any>({});

	const permissions = ref<any>({
		clients_user_view: false,
		clients_user_create: false,
		clients_user_view_all: false,
		clients_user_edit: false,
		clients_user_delete: false,
		suppliers_admin_create: false,
		suppliers_admin_edit: false,
		suppliers_admin_delete: false,
		suppliers_admin_view: false,
		suppliers_admin_view_all: false,
		clients_company_update: false,
		suppliers_user_create: false,
		suppliers_user_edit: false,
		suppliers_user_delete: false,
		suppliers_user_view: false,
		suppliers_user_view_all: false,
		contracts_create: false,
		contracts_edit: false,
		contracts_delete: false,
		contracts_view: false,
		contracts_view_all: false,
		request_create: false,
		request_edit: false,
		request_delete: false,
		request_view: false,
		request_view_all: false,
		// project_create: false,
		project_edit: false,
		// project_delete: false,
		project_view: false,
		project_view_all: false,
		role_create: false,
		role_edit: false,
		role_delete: false,
		role_view: false,
		clients_user_all: false,
		suppliers_admin_all: false,
		suppliers_user_all: false,
		contracts_all: false,
		request_all: false,
		project_all: false,
		role_all: false,
		resource_create: false,
		resource_edit: false,
		resource_delete: false,
		resource_view: false,
		tender_create: false,
		tender_edit: false,
		tender_delete: false,
		tender_view: false,
		tender_view_all: false,
	});

	const rules = computed(() => {
		return {
			name: {
				required: helpers.withMessage(t("formValidations.user_role"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		await getAllPermissions();
		if (route.params?.id) {
			await getEditData();
		}
	});

	const getAllPermissions = async () => {
		try {
			const res: any = await useApiFetch(`/access-roles/list/permissions`, {
				method: "GET",
			});
			res.data?.permissions?.forEach((data: any) => {
				getPermissions.value[data.slug] = data.id;
			});
		} catch {}
	};

	const getEditData = async () => {
		try {
			const res: any = await useApiFetch(`/access-roles/${route.params?.id}`, {
				method: "GET",
			});
			formData.name = res.data?.name;
			formData.slug = res.data?.name
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "-")
				.trim();
			res.data?.permissions.forEach((data: any) => {
				const slug = data.slug.replace(/-/g, "_");
				permissions.value[slug] = true;
			});
			checkAllClientsSelected();
			checkAllSuppliersSelected();
			checkAllSuppliersUserSelected();
			checkAllContractSelected();
			checkAllRequestSelected();
			checkAllProjectSelected();
			checkAllRoleSelected();
			checkAllResourceSelected();
			checkAllTenderSelected();
		} catch {}
	};

	const roleChange = (value: any) => {
		v$.value.name.$touch();
		formData.slug = value
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.trim();
	};

	const checkAllClientsSelected = () => {
		if (
			permissions.value.clients_user_create &&
			permissions.value.clients_user_edit &&
			permissions.value.clients_user_delete &&
			permissions.value.clients_user_view &&
			permissions.value.clients_user_view_all
		) {
			permissions.value.clients_user_all = true;
		}
	};

	const handleCheckedClientsAll = (value: any) => {
		if (value) {
			permissions.value.clients_user_edit = true;
			permissions.value.clients_user_create = true;
			permissions.value.clients_user_delete = true;
			permissions.value.clients_user_view = true;
			permissions.value.clients_user_view_all = true;
		} else {
			permissions.value.clients_user_edit = false;
			permissions.value.clients_user_create = false;
			permissions.value.clients_user_delete = false;
			permissions.value.clients_user_view = false;
			permissions.value.clients_user_view_all = false;
		}
	};

	const handleCheckedClientsCreate = (value: any) => {
		checkAllClientsSelected();
		if (value) {
			permissions.value.clients_user_view = true;
		} else {
			permissions.value.clients_user_all = false;
		}
	};

	const handleCheckedClientsView = (value: any) => {
		checkAllClientsSelected();
		if (!value && !permissions.value.clients_user_view_all) {
			permissions.value.clients_user_edit = false;
			permissions.value.clients_user_create = false;
			permissions.value.clients_user_delete = false;
		} else if (!value) {
			permissions.value.clients_user_all = false;
		}
	};

	const handleCheckedClientsViewAll = (value: any) => {
		checkAllClientsSelected();
		if (!value && !permissions.value.clients_user_view) {
			permissions.value.clients_user_edit = false;
			permissions.value.clients_user_create = false;
			permissions.value.clients_user_delete = false;
		} else if (!value) {
			permissions.value.clients_user_all = false;
		}
	};

	const checkAllSuppliersSelected = () => {
		if (
			permissions.value.suppliers_admin_create &&
			permissions.value.suppliers_admin_edit &&
			permissions.value.suppliers_admin_delete &&
			permissions.value.suppliers_admin_view &&
			permissions.value.suppliers_admin_view_all
		) {
			permissions.value.suppliers_admin_all = true;
		}
	};

	const handleCheckedSuppliersAll = (value: any) => {
		if (value) {
			permissions.value.suppliers_admin_edit = true;
			permissions.value.suppliers_admin_create = true;
			permissions.value.suppliers_admin_delete = true;
			permissions.value.suppliers_admin_view = true;
			permissions.value.suppliers_admin_view_all = true;
		} else {
			permissions.value.suppliers_admin_edit = false;
			permissions.value.suppliers_admin_create = false;
			permissions.value.suppliers_admin_delete = false;
			permissions.value.suppliers_admin_view = false;
			permissions.value.suppliers_admin_view_all = false;
		}
	};

	const handleCheckedSuppliersCreate = (value: any) => {
		checkAllSuppliersSelected();
		if (value) {
			permissions.value.suppliers_admin_view = true;
		} else {
			permissions.value.suppliers_admin_all = false;
		}
	};

	const handleCheckedSuppliersView = (value: any) => {
		checkAllSuppliersSelected();
		if (!value && !permissions.value.suppliers_admin_view_all) {
			permissions.value.suppliers_admin_edit = false;
			permissions.value.suppliers_admin_create = false;
			permissions.value.suppliers_admin_delete = false;
		} else if (!value) {
			permissions.value.suppliers_admin_all = false;
		}
	};

	const handleCheckedSuppliersViewAll = (value: any) => {
		checkAllSuppliersSelected();
		if (!value && !permissions.value.suppliers_admin_view) {
			permissions.value.suppliers_admin_edit = false;
			permissions.value.suppliers_admin_create = false;
			permissions.value.suppliers_admin_delete = false;
		} else if (!value) {
			permissions.value.suppliers_admin_all = false;
		}
	};

	const checkAllSuppliersUserSelected = () => {
		if (
			permissions.value.suppliers_user_create &&
			permissions.value.suppliers_user_edit &&
			permissions.value.suppliers_user_delete &&
			permissions.value.suppliers_user_view &&
			permissions.value.suppliers_user_view_all
		) {
			permissions.value.suppliers_user_all = true;
		}
	};

	const handleCheckedSuppliersUserAll = (value: any) => {
		if (value) {
			permissions.value.suppliers_user_edit = true;
			permissions.value.suppliers_user_create = true;
			permissions.value.suppliers_user_delete = true;
			permissions.value.suppliers_user_view = true;
			permissions.value.suppliers_user_view_all = true;
			permissions.value.suppliers_admin_view = true;
		} else {
			permissions.value.suppliers_user_edit = false;
			permissions.value.suppliers_user_create = false;
			permissions.value.suppliers_user_delete = false;
			permissions.value.suppliers_user_view = false;
			permissions.value.suppliers_user_view_all = false;
			permissions.value.suppliers_admin_view = false;
		}
	};

	const handleCheckedSuppliersUserCreate = (value: any) => {
		checkAllSuppliersUserSelected();
		if (value) {
			permissions.value.suppliers_user_view = true;
			permissions.value.suppliers_admin_view = true;
		} else {
			permissions.value.suppliers_user_all = false;
		}
	};

	const handleCheckedSuppliersUserView = (value: any) => {
		checkAllSuppliersUserSelected();
		if (!value && !permissions.value.suppliers_user_view_all) {
			permissions.value.suppliers_user_create = false;
			permissions.value.suppliers_user_edit = false;
			permissions.value.suppliers_user_delete = false;
			permissions.value.suppliers_admin_view = false;
		} else if (!value) {
			permissions.value.suppliers_user_all = false;
		}
		if (value) {
			permissions.value.suppliers_admin_view = true;
		}
	};

	const handleCheckedSuppliersUserViewAll = (value: any) => {
		checkAllSuppliersUserSelected();
		if (!value && !permissions.value.suppliers_user_view) {
			permissions.value.suppliers_user_create = false;
			permissions.value.suppliers_user_edit = false;
			permissions.value.suppliers_user_delete = false;
			permissions.value.suppliers_admin_view = false;
		} else if (!value) {
			permissions.value.suppliers_user_all = false;
		}
		if (value) {
			permissions.value.suppliers_admin_view = true;
		}
	};

	const checkAllContractSelected = () => {
		if (
			permissions.value.contracts_create &&
			permissions.value.contracts_edit &&
			permissions.value.contracts_delete &&
			permissions.value.contracts_view &&
			permissions.value.contracts_view_all
		) {
			permissions.value.contracts_all = true;
		}
	};

	const handleCheckedContractsAll = (value: any) => {
		if (value) {
			permissions.value.contracts_edit = true;
			permissions.value.contracts_create = true;
			permissions.value.contracts_delete = true;
			permissions.value.contracts_view = true;
			permissions.value.contracts_view_all = true;
		} else {
			permissions.value.contracts_edit = false;
			permissions.value.contracts_create = false;
			permissions.value.contracts_delete = false;
			permissions.value.contracts_view = false;
			permissions.value.contracts_view_all = false;
		}
	};

	const handleCheckedContractCreate = (value: any) => {
		checkAllContractSelected();
		if (value) {
			permissions.value.contracts_view = true;
		} else {
			permissions.value.contracts_all = false;
		}
	};

	const handleCheckedContractView = (value: any) => {
		checkAllContractSelected();
		if (!value && !permissions.value.contracts_view_all) {
			permissions.value.contracts_create = false;
			permissions.value.contracts_edit = false;
			permissions.value.contracts_delete = false;
		} else if (!value) {
			permissions.value.contracts_all = false;
		}
	};

	const handleCheckedContractViewAll = (value: any) => {
		checkAllContractSelected();
		if (!value && !permissions.value.contracts_view) {
			permissions.value.contracts_create = false;
			permissions.value.contracts_edit = false;
			permissions.value.contracts_delete = false;
		} else if (!value) {
			permissions.value.contracts_all = false;
		}
	};

	const checkAllRequestSelected = () => {
		if (
			permissions.value.request_create &&
			permissions.value.request_edit &&
			permissions.value.request_delete &&
			permissions.value.request_view &&
			permissions.value.request_view_all
		) {
			permissions.value.request_all = true;
		}
	};

	const handleCheckedRequestsAll = (value: any) => {
		if (value) {
			permissions.value.request_edit = true;
			permissions.value.request_create = true;
			permissions.value.request_delete = true;
			permissions.value.request_view = true;
			permissions.value.request_view_all = true;
		} else {
			permissions.value.request_edit = false;
			permissions.value.request_create = false;
			permissions.value.request_delete = false;
			permissions.value.request_view = false;
			permissions.value.request_view_all = false;
		}
	};

	const handleCheckedRequestCreate = (value: any) => {
		checkAllRequestSelected();
		if (value) {
			permissions.value.request_view = true;
		} else {
			permissions.value.request_all = false;
		}
	};

	const handleCheckedRequestView = (value: any) => {
		checkAllRequestSelected();
		if (!value && !permissions.value.request_view_all) {
			permissions.value.request_create = false;
			permissions.value.request_edit = false;
			permissions.value.request_delete = false;
		} else if (!value) {
			permissions.value.request_all = false;
		}
	};

	const handleCheckedRequestViewAll = (value: any) => {
		checkAllRequestSelected();
		if (!value && !permissions.value.request_view) {
			permissions.value.request_create = false;
			permissions.value.request_edit = false;
			permissions.value.request_delete = false;
		} else if (!value) {
			permissions.value.request_all = false;
		}
	};

	const checkAllProjectSelected = () => {
		if (
			// permissions.value.project_create &&
			permissions.value.project_edit &&
			// permissions.value.project_delete &&
			permissions.value.project_view &&
			permissions.value.project_view_all
		) {
			permissions.value.project_all = true;
		}
	};

	const handleCheckedProjectsAll = (value: any) => {
		if (value) {
			permissions.value.project_edit = true;
			// permissions.value.project_create = true;
			// permissions.value.project_delete = true;
			permissions.value.project_view = true;
			permissions.value.project_view_all = true;
		} else {
			permissions.value.project_edit = false;
			// permissions.value.project_create = false;
			// permissions.value.project_delete = false;
			permissions.value.project_view = false;
			permissions.value.project_view_all = false;
		}
	};

	const handleCheckedProjectCreate = (value: any) => {
		checkAllProjectSelected();
		if (value) {
			permissions.value.project_view = true;
		} else {
			permissions.value.project_all = false;
		}
	};

	const handleCheckedProjectView = (value: any) => {
		checkAllProjectSelected();
		if (!value && !permissions.value.project_view_all) {
			permissions.value.project_create = false;
			permissions.value.project_edit = false;
			permissions.value.project_delete = false;
		} else if (!value) {
			permissions.value.project_all = false;
		}
	};

	const handleCheckedProjectViewAll = (value: any) => {
		checkAllProjectSelected();
		if (!value && !permissions.value.project_view) {
			// permissions.value.project_create = false;
			permissions.value.project_edit = false;
			// permissions.value.project_delete = false;
		} else if (!value) {
			permissions.value.project_all = false;
		}
	};

	const checkAllRoleSelected = () => {
		if (permissions.value.role_create && permissions.value.role_edit && permissions.value.role_delete && permissions.value.role_view) {
			permissions.value.role_all = true;
		}
	};

	const handleCheckedRoleAll = (value: any) => {
		if (value) {
			permissions.value.role_edit = true;
			permissions.value.role_create = true;
			permissions.value.role_delete = true;
			permissions.value.role_view = true;
		} else {
			permissions.value.role_edit = false;
			permissions.value.role_create = false;
			permissions.value.role_delete = false;
			permissions.value.role_view = false;
		}
	};

	const handleCheckedRoleCreate = (value: any) => {
		checkAllRoleSelected();
		if (value) {
			permissions.value.role_view = true;
		} else {
			permissions.value.role_all = false;
		}
	};

	const handleCheckedRoleView = (value: any) => {
		checkAllRoleSelected();
		if (!value) {
			permissions.value.role_create = false;
			permissions.value.role_edit = false;
			permissions.value.role_delete = false;
			permissions.value.role_all = false;
		}
	};

	const checkAllResourceSelected = () => {
		if (
			permissions.value.resource_create &&
			permissions.value.resource_edit &&
			permissions.value.resource_delete &&
			permissions.value.resource_view
		) {
			permissions.value.resource_all = true;
		}
	};

	const handleCheckedResourceAll = (value: any) => {
		if (value) {
			permissions.value.resource_edit = true;
			permissions.value.resource_create = true;
			permissions.value.resource_delete = true;
			permissions.value.resource_view = true;
		} else {
			permissions.value.resource_edit = false;
			permissions.value.resource_create = false;
			permissions.value.resource_delete = false;
			permissions.value.resource_view = false;
		}
	};

	const handleCheckedResourceCreate = (value: any) => {
		checkAllResourceSelected();
		if (value) {
			permissions.value.resource_view = true;
		} else {
			permissions.value.resource_all = false;
		}
	};

	const handleCheckedResourceView = (value: any) => {
		checkAllResourceSelected();
		if (!value) {
			permissions.value.resource_create = false;
			permissions.value.resource_edit = false;
			permissions.value.resource_delete = false;
			permissions.value.resource_all = false;
		}
	};

	const checkAllTenderSelected = () => {
		if (
			permissions.value.tender_create &&
			permissions.value.tender_edit &&
			permissions.value.tender_delete &&
			permissions.value.tender_view &&
			permissions.value.tender_view_all
		) {
			permissions.value.tender_all = true;
		}
	};

	const handleCheckedTendereAll = (value: any) => {
		if (value) {
			permissions.value.tender_edit = true;
			permissions.value.tender_create = true;
			permissions.value.tender_delete = true;
			permissions.value.tender_view = true;
			permissions.value.tender_view_all = true;
		} else {
			permissions.value.tender_edit = false;
			permissions.value.tender_create = false;
			permissions.value.tender_delete = false;
			permissions.value.tender_view = false;
			permissions.value.tender_view_all = false;
		}
	};

	const handleCheckedTenderCreate = (value: any) => {
		checkAllTenderSelected();
		if (value) {
			permissions.value.tender_view = true;
		} else {
			permissions.value.tender_all = false;
		}
	};
	const handleCheckedtenderView = (value: any) => {
		checkAllTenderSelected();
		if (!value && !permissions.value.tender_view_all) {
			permissions.value.tender_create = false;
			permissions.value.tender_edit = false;
			permissions.value.tender_delete = false;
		} else if (!value) {
			permissions.value.tender_all = false;
		}
	};

	const handleCheckedTenderViewAll = (value: any) => {
		checkAllTenderSelected();
		if (!value && !permissions.value.tender_view) {
			permissions.value.tender_create = false;
			permissions.value.tender_edit = false;
			permissions.value.tender_delete = false;
		} else if (!value) {
			permissions.value.tender_all = false;
		}
	};

	const onSubmit = () => {
		v$.value.$validate();

		if (!v$.value.$error) {
			if (route.params?.id) {
				submitEditData();
			} else {
				submitAddData();
			}
		}
	};

	const submitAddData = async () => {
		const data = Object.keys(permissions.value).filter((key: any) => permissions.value[key]);
		const updatedData = data.map((key: any) => key.replace(/_/g, "-"));

		const newIdArray = updatedData.map((slug: any) => getPermissions.value[slug]);
		formData.permissions = newIdArray.filter((id: any) => id !== undefined);

		try {
			const res: any = await useApiFetch(`/access-roles`, {
				method: "POST",
				body: formData,
			});
			useToast("success", res.message);
			navigateTo(localePath("/roles-permissions"));
		} catch {}
	};
	const submitEditData = async () => {
		const data = Object.keys(permissions.value).filter((key: any) => permissions.value[key]);
		const updatedData = data.map((key: any) => key.replace(/_/g, "-"));

		const newIdArray = updatedData.map((slug: any) => getPermissions.value?.[slug]);

		formData.permissions = newIdArray.filter((id: any) => id !== undefined);

		try {
			const res: any = await useApiFetch(`/access-roles/${route.params?.id}`, {
				method: "PATCH",
				body: formData,
			});
			useToast("success", res.message);
			navigateTo(localePath("/roles-permissions"));
		} catch {}
	};

	const cancelClick = () => {
		if (route.params?.id) {
			const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
			const data = {
				page: pageDetails?.page,
				perPage: pageDetails?.perPage,
				searchValue: pageDetails?.searchValue,
				sortOrder: pageDetails?.sortOrder,
				sortColumn: pageDetails?.sortColumn,
			};

			navigateTo(
				localePath({
					path: "/roles-permissions",
					query: data,
				})
			);
		} else {
			navigateTo(localePath("/roles-permissions"));
		}
	};
</script>

<template>
	<div class="p-6">
		<el-alert type="warning" class="mb-8">
			<template #default>
				<div class="mb-1">
					<p><strong>All - </strong>Grant all permissions for the module. Users will be able to create, edit, view everything</p>
					<p><strong>Create - </strong>Allow users to create new items. Users cannot edit existing or new items</p>
					<p><strong>Edit - </strong>Grant users the ability to modify existing items. Users cannot create new items</p>
					<p>
						<strong>View - </strong>Users can only view items they created. They cannot view items created by other users. Users cannot
						create or edit items.
					</p>
					<p>
						<strong>View all - </strong>Allow users to view all items regardless of who created them. Users cannot create or edit items.
					</p>
				</div>
			</template>
		</el-alert>

		<el-form class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
			<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]" :label="$t('formLabels.user_role')">
				<el-input
					v-model="formData.name"
					type="text"
					name="name"
					:disabled="disabled || route.params?.id"
					maxLength="200"
					:class="{
						error: v$.name.$error,
					}"
					@keypress="CharcAndNumber"
					@change="roleChange"
				/>
				<span v-if="v$.name.$error" class="text-xs text-red-500 mt-2">{{ v$.name.$errors[0].$message }}</span>
			</el-form-item>
		</el-form>

		<div class="mt-5">
			<div id="my-clients flex">
				<div class="el-table--fit el-table--enable-row-hover el-table--enable-row-transition el-table el-table--layout-fixed">
					<div class="el-scrollbar__view">
						<table class="el-table__body w-full">
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("formLabels.module_title") }}
								</td>
								<td class="el-table__cell font-bold !text-center" colspan="5">
									{{ $t("formLabels.permissions") }}
								</td>
							</tr>
							<!-- <tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.client_users") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-all"
										v-model="permissions.clients_user_all"
										@change="handleCheckedClientsAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-create"
										v-model="permissions.clients_user_create"
										@change="handleCheckedClientsCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-edit"
										v-model="permissions.clients_user_edit"
										@change="handleCheckedClientsCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-delete"
										v-model="permissions.clients_user_delete"
										@change="handleCheckedClientsCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td>

								<el-checkbox label="clients-user-all">{{ $t('formLabels.all') }}</el-checkbox>

								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-view"
										v-model="permissions.clients_user_view"
										@change="handleCheckedClientsView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="clients-user-view-all"
										v-model="permissions.clients_user_view_all"
										@change="handleCheckedClientsViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr> -->
							<!-- <tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.my_company") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox label="clients-user-create" v-model="permissions.clients_company_update" :disabled="disabled"
										>{{ $t('buttons.edit') }}</el-checkbox
									>
								</td>
							</tr> -->
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.suppliers") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-all"
										v-model="permissions.suppliers_admin_all"
										@change="handleCheckedSuppliersAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-create"
										v-model="permissions.suppliers_admin_create"
										@change="handleCheckedSuppliersCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-edit"
										v-model="permissions.suppliers_admin_edit"
										@change="handleCheckedSuppliersCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<!-- <td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-delete"
										v-model="permissions.suppliers_admin_delete"
										@change="handleCheckedSuppliersCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td> -->
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-view"
										v-model="permissions.suppliers_admin_view"
										@change="handleCheckedSuppliersView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_admin-view-all"
										v-model="permissions.suppliers_admin_view_all"
										@change="handleCheckedSuppliersViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.supplier_users") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers_user-all"
										v-model="permissions.suppliers_user_all"
										@change="handleCheckedSuppliersUserAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers-user-create"
										v-model="permissions.suppliers_user_create"
										@change="handleCheckedSuppliersUserCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers-user-edit"
										v-model="permissions.suppliers_user_edit"
										@change="handleCheckedSuppliersUserCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<!-- <td class="el-table__cell">
									<el-checkbox
										label="suppliers-user-delete"
										v-model="permissions.suppliers_user_delete"
										@change="handleCheckedSuppliersUserCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td> -->
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers-user-view"
										v-model="permissions.suppliers_user_view"
										@change="handleCheckedSuppliersUserView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="suppliers-user-view-all"
										v-model="permissions.suppliers_user_view_all"
										@change="handleCheckedSuppliersUserViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.contracts") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="contracts-all"
										v-model="permissions.contracts_all"
										@change="handleCheckedContractsAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="contracts-create"
										v-model="permissions.contracts_create"
										@change="handleCheckedContractCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="contracts-edit"
										v-model="permissions.contracts_edit"
										@change="handleCheckedContractCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<!-- <td class="el-table__cell">
									<el-checkbox
										label="contracts-delete"
										v-model="permissions.contracts_delete"
										@change="handleCheckedContractCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td> -->
								<td class="el-table__cell">
									<el-checkbox
										label="contracts-view"
										v-model="permissions.contracts_view"
										@change="handleCheckedContractView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="contracts-view-all"
										v-model="permissions.contracts_view_all"
										@change="handleCheckedContractViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.requests") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="request-all"
										v-model="permissions.request_all"
										@change="handleCheckedRequestsAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="request-create"
										v-model="permissions.request_create"
										@change="handleCheckedRequestCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="request-edit"
										v-model="permissions.request_edit"
										@change="handleCheckedRequestCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<!-- <td class="el-table__cell">
									<el-checkbox
										label="request-delete"
										v-model="permissions.request_delete"
										@change="handleCheckedRequestCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td> -->
								<td class="el-table__cell">
									<el-checkbox
										label="request-view"
										v-model="permissions.request_view"
										@change="handleCheckedRequestView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="request-view-all"
										v-model="permissions.request_view_all"
										@change="handleCheckedRequestViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.projects") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="project-all"
										v-model="permissions.project_all"
										@change="handleCheckedProjectsAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<!-- <td class="el-table__cell">
									<el-checkbox
										label="project-create"
										v-model="permissions.project_create"
										@change="handleCheckedProjectCreate"
										:disabled="disabled"
										>{{ $t('buttons.create') }}</el-checkbox
									>
								</td>
								
								<td class="el-table__cell">
									<el-checkbox
										label="project-delete"
										v-model="permissions.project_delete"
										@change="handleCheckedProjectCreate"
										:disabled="disabled"
										>{{ $t('buttons.delete') }}</el-checkbox
									>
								</td> -->
								<td class="el-table__cell">
									<el-checkbox
										label="project-edit"
										v-model="permissions.project_edit"
										@change="handleCheckedProjectCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="project-view"
										v-model="permissions.project_view"
										@change="handleCheckedProjectView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="project-view-all"
										v-model="permissions.project_view_all"
										:disabled="disabled"
										@change="handleCheckedProjectViewAll"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
							<!-- <tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.roles") }}
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="role-all"
										v-model="permissions.role_all"
										@change="handleCheckedRoleAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="role-create"
										v-model="permissions.role_create"
										@change="handleCheckedRoleCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="role-edit"
										v-model="permissions.role_edit"
										@change="handleCheckedRoleCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="role-delete"
										v-model="permissions.role_delete"
										@change="handleCheckedRoleCreate"
										:disabled="disabled"
										>{{ $t("buttons.delete") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="role-view"
										v-model="permissions.role_view"
										@change="handleCheckedRoleView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
							</tr> -->

							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.resources") }}
								</td>

								<td class="el-table__cell">
									<el-checkbox
										label="role-all"
										v-model="permissions.resource_all"
										@change="handleCheckedResourceAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>

								<td class="el-table__cell">
									<el-checkbox
										label="tender-create"
										v-model="permissions.resource_create"
										@change="handleCheckedResourceCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="resource-edit"
										v-model="permissions.resource_edit"
										@change="handleCheckedResourceCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="resource-delete"
										v-model="permissions.resource_delete"
										@change="handleCheckedResourceCreate"
										:disabled="disabled"
										>{{ $t("buttons.delete") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="resource-view"
										v-model="permissions.resource_view"
										@change="handleCheckedResourceView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
							</tr>

							<tr class="el-table__row">
								<td class="el-table__cell font-bold">
									{{ $t("header.tender") }}
								</td>

								<td class="el-table__cell">
									<el-checkbox
										label="tender-all"
										v-model="permissions.tender_all"
										@change="handleCheckedTendereAll"
										:disabled="disabled"
										>{{ $t("formLabels.all") }}</el-checkbox
									>
								</td>

								<td class="el-table__cell">
									<el-checkbox
										label="tender-create"
										v-model="permissions.tender_create"
										@change="handleCheckedTenderCreate"
										:disabled="disabled"
										>{{ $t("buttons.create") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="tender-edit"
										v-model="permissions.tender_edit"
										@change="handleCheckedTenderCreate"
										:disabled="disabled"
										>{{ $t("buttons.edit") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="tender-delete"
										v-model="permissions.tender_delete"
										@change="handleCheckedTenderCreate"
										:disabled="disabled"
										>{{ $t("buttons.delete") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="tender-view"
										v-model="permissions.tender_view"
										@change="handleCheckedtenderView"
										:disabled="disabled"
										>{{ $t("buttons.view") }}</el-checkbox
									>
								</td>
								<td class="el-table__cell">
									<el-checkbox
										label="tender-view-all"
										v-model="permissions.tender_view_all"
										@change="handleCheckedTenderViewAll"
										:disabled="disabled"
										>{{ $t("buttons.view_all") }}</el-checkbox
									>
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="mt-4 text-right">
			<novok-button class="btn-dark" :loading="loading" @click="cancelClick">{{ $t("buttons.cancel") }}</novok-button>
			<novok-button type="info" v-if="!route.params?.id" @click="onSubmit" :loading="loading">{{ $t("buttons.add_role") }}</novok-button>
			<novok-button type="info" v-if="route.params?.id && !disabled" @click="onSubmit" :loading="loading">{{
				$t("buttons.save")
			}}</novok-button>
		</div>
	</div>
</template>
