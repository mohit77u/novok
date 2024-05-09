<script setup lang="ts">
	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
		id: {
			type: String,
			default: "",
		},
		previewBtn: {
			type: Boolean,
			default: false,
		},
		editIcon: {
			type: Boolean,
			default: false,
		},
		deleteBtn: {
			type: Boolean,
			default: false,
		},
		archivedBtn: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits([
		"handle-archvied",
		"handle-edit",
		"handle-view",
		"handle-delete",
		"handle-retry",
		"handle-email-trigger",
		"handle-preview-document",
		"handle-clone",
		"handle-client-admin-access",
		"handle-supplier-user",
		"handle-status-change",
		"supplier-status",
		"supplier-unapproved-status",
		"handle-client-admin-request-approved",
		"qt-reject-status",
		"qt-approve-status",
	]);

	const rowId = ref("");
	const dialogVisibleWorkProgressModal = ref(false);

	const dialogOkClickWorkProgressModal = (value: any) => {
		dialogVisibleWorkProgressModal.value = value;
	};

	const route = useRoute();

	const handleArchived = (row: any) => {
		emit("handle-archvied", row);
	};
	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};
	const handleView = (row: any) => {
		emit("handle-view", row);
	};
	const handleRetry = (row: any) => {
		emit("handle-retry", row);
	};
	const handleDelete = (row: any) => {
		emit("handle-delete", row);
	};
	const handleEmailTrigger = (row: any) => {
		emit("handle-email-trigger", row);
	};
	const handlePreviewDocument = (row: any) => {
		emit("handle-preview-document", row);
	};
	const handleCloneContract = (row: any) => {
		emit("handle-clone", row);
	};
	const handleClientAdminAccess = (row: any) => {
		emit("handle-client-admin-access", row);
	};
	const handleClientAdminRequestApproved = (row: any) => {
		emit("handle-client-admin-request-approved", row);
	};
	const handleSupplierUser = (row: any) => {
		emit("handle-supplier-user", row);
	};
	const handleStatusChange = (row: any) => {
		emit("handle-status-change", row);
	};
	const handleSupplierStatusChange = (row: any, value: any) => {
		emit("supplier-status", row, value);
	};

	const hanldeSupplierUnapprovedStatusChange = (row: any, value: any, formData: any) => {
		emit("supplier-unapproved-status", row, value, formData);
	};

	const qtRejectStatusData = (Id: any, formData: any) => {
		emit("qt-reject-status", Id, formData);
	};

	const qtApproveStatusData = (Id: any) => {
		emit("qt-approve-status", Id, "");
	};
</script>
<template>
	<div class="px-4 pb-4" v-if="tableData.length">
		<!--super user -->
		<GridViewSuperUser v-if="props.id === 'super_user'" :table-data="props.tableData" @handle-view="handleView" @handle-edit="handleEdit" />

		<!--contact us inquiry -->
		<GridViewContactUs
			v-if="props.id === 'contact_us_inquiry'"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-archived="handleArchived"
		/>

		<!--client admin -->
		<GridViewClientAdmin
			v-if="props.id === 'client_admin'"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
			@handle-retry="handleRetry"
			@handle-client-admin-access="handleClientAdminAccess"
		/>

		<!--client Request -->
		<grid-view-client-requests
			v-if="props.id === 'client_requests'"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-client-admin-request-approved="handleClientAdminRequestApproved"
		/>

		<!-- client account manager -->
		<GridViewClientManager
			v-if="props.id === 'client_manager'"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>

		<!-- client user -->
		<GridViewClientUser
			v-if="props.id === 'client_user'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>

		<!-- suppliers-->
		<GridViewSuppliers
			v-if="props.id === 'supplier'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
			@handle-supplier-user="handleSupplierUser"
			@supplier-status="handleSupplierStatusChange"
			@supplier-unapproved-status="hanldeSupplierUnapprovedStatusChange"
		/>

		<!-- supplier directory-->
		<GridViewSuppliersDirectory
			v-if="props.id === 'supplier_directory'"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
			@handle-supplier-user="handleSupplierUser"
			@supplier-status="handleSupplierStatusChange"
		/>

		<!-- supplier user-->
		<GridViewSupplierUser
			v-if="props.id === 'supplier_user'"
			:table-data="props.tableData"
			:edit-icon="editIcon"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>

		<!-- contracts-->
		<GridViewContracts
			v-if="props.id === 'contract'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
			@handle-email-trigger="handleEmailTrigger"
			@handle-preview-document="handlePreviewDocument"
			@handle-clone-contract="handleCloneContract"
			@handle-status-change="handleStatusChange"
		/>

		<!-- request-->
		<GridViewRequest
			v-if="props.id === 'request'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>
		<!-- project-->
		<GridViewProject
			v-if="props.id === 'project'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>
		<!-- quotations_tender -->
		<GridViewQT
			v-if="props.id === 'quotation_tender'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
			@qt-reject-status="qtRejectStatusData"
			@qt-approve-status="qtApproveStatusData"
		/>

		<!-- supplier quotations_tender -->
		<GridViewSupplierQT
			v-if="props.id === 'supplier_quotations_tender'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>
		<!-- qt-responses  -->
		<GridViewQTResponses
			v-if="props.id === 'qt-responses'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>

		<!-- qt-responses  -->
		<GridViewSigningEntity
			v-if="props.id === 'signing_entity'"
			:edit-icon="editIcon"
			:table-data="props.tableData"
			@handle-view="handleView"
			@handle-edit="handleEdit"
		/>
	</div>
	<div v-else class="text-center py-10 font-bold h-full flex items-center justify-center">
		<h1 class="font-bold text-dark">No data found.</h1>
	</div>

	<!-- </div> -->
</template>
