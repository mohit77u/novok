<script setup lang="ts">
import { useFullscreenLoading } from "~/store/fullscreenLoading";
import { CurrencySymbole, months } from "~/helper/data";
import { useAuthStore } from "~/store/auth";
import { useProfileStore } from "~/store/profile";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";
import { abbreviateNumber } from "~/helper/common";

definePageMeta({
	middleware: ["auth", "supplier"],
});

useHead({
	title: "Dashboard",
});

const authStore = useAuthStore();
const profileStore = useProfileStore();
const router = useRouter();
const localePath = useLocalePath();
const fullscreenLoading = ref(false);
const roleId = ref<any>("");
const exportLoading = ref<any>(false);
const showLabel = ref<any>(true);
const benefitData = ref<any>({});
const outstandingComplianceData = ref<any>({});
const supplierStatusValues = ref<any>([]);
const activityStatusValues = ref<any>([]);
const contractValidationsValues = ref<any>([]);
const contractExpiringValues = ref<any>([]);
const contractNoticePeriodValues = ref<any>([]);
const contractNoticePeriodKeys = ref<any>([]);
const projectPipelineValues = ref<any>({});
const dashboardProjectPipeline = ref<any>({});
const dashboardProjectPipelineData = ref<any>({});
const dashboardAllData = ref<any>({});
const dashboardData = ref<any>([]);
const dashboardTargetData = ref<any>({});
const isExport = ref(false);

const getProfileData = computed(() => {
	return profileStore.getProfileData;
});

onMounted(async () => {
	const role_id = useCookie("role_id");
	roleId.value = role_id.value;

	if (roleId.value == "client_admin" || roleId.value == "client_user") {
		await getDashboarData();
		await getDashboardAllData();
		await getDashboardProjectData();
	}
});

const progressFormat = (percentage: any) => `${percentage}`;

const { t } = useI18n();

const suppliersStatus = ref<any>({
	approved_contracted: "",
	approved_uncontracted: "",
	unapproved_contracted: "",
	uncontracted_unapproved: "",
});

const getDashboarData = async () => {
	fullscreenLoading.value = true;
	try {
		const res: any = await useApiFetch(`/user-ms/dashboard`, {
			method: "GET",
		});
		dashboardData.value = res.data;
		benefitData.value = res.data;
		outstandingComplianceData.value = res.data?.outstanding_compliance;
		let sum = parseInt(res.data?.outstanding_compliance?.unapproved) + parseInt(res.data?.outstanding_compliance?.approved);

		outstandingComplianceData.value.valueData = [
			{ name: t("chartLabels.unapproved"), value: sum == 0 ? 0.3 : res.data?.outstanding_compliance?.unapproved },
			{ name: t("chartLabels.approved"), value: sum == 0 ? 0.3 : res.data?.outstanding_compliance?.approved },
		];

		// const suppliers = Object.entries(suppliersStatus.value).map(([key, value]) => {
		// 	const valueKey: any = key.trim();
		// 	return {
		// 		name: t("chartLabels." + valueKey),
		// 		value:
		// 			res.data?.supplier_status[valueKey] == undefined || res.data?.supplier_status[valueKey] == 0
		// 				? 0
		// 				: res.data?.supplier_status[valueKey],
		// 	};
		// });

		supplierStatusValues.value = res.data?.supplier_status;
	} catch {
	} finally {
		// fullscreenLoading.value = false;
	}
};

const getDashboardAllData = async () => {
	// fullscreenLoading.value = true;
	try {
		const res: any = await useApiFetch(`/contract-ms/dashboard`, {
			method: "GET",
		});
		dashboardAllData.value = res.data;

		// contractValidationsValues.value = Object.entries(dataValue).map(([key, value]) => {
		// 	const valueKey = key.trim();
		// 	return {
		// 		name: t("chartLabels." + valueKey),
		// 		value: value == undefined || value == 0 ? 0 : value,
		// 	};
		// });

        let sum = parseInt(res.data?.contract_validation?.unvalidated) + parseInt(res.data?.contract_validation?.validated);

		contractValidationsValues.value = [
			{ name: t("chartLabels.unvalidated"), value: sum == 0 ? 0.3 : res.data?.contract_validation?.unvalidated },
			{ name: t("chartLabels.validated"), value: sum == 0 ? 0.3 : res.data?.contract_validation?.validated },
		];

		contractExpiringValues.value = Object.values(res.data?.contract_expiring).map((value) => (value == undefined || value == 0 ? 0 : value));

		contractNoticePeriodValues.value = Object.values(res.data?.contract_notice_period).map((value) =>
			value == undefined || value == 0 ? 0 : value
		);

		contractNoticePeriodKeys.value = Object.keys(res.data?.contract_notice_period).map((key) => {
			const [year, month]: any = key.split("-");
			return months[month as keyof typeof months] + " " + year;
		});
	} catch {
	} finally {
		fullscreenLoading.value = false;
	}
};

const getDashboardProjectData = async () => {
	// fullscreenLoading.value = true;
	try {
		const res: any = await useApiFetch(`/project-ms/dashboard`, {
			method: "GET",
		});
		dashboardProjectPipeline.value = res.data;

		const target = benefitData.value.target_savings ? parseInt(benefitData.value.target_savings) : 0;
		const estimated = res?.data?.estimated_savings ? parseInt(res?.data?.estimated_savings) : 0;
		const actual = res?.data?.actual_savings ? parseInt(res?.data?.actual_savings) : 0;

		const gap = target - (estimated + actual);
		// dashboardTargetData.value.gap = gap
		// dashboardTargetData.value.target = target
		// dashboardTargetData.value.estimated = estimated
		// dashboardTargetData.value.actual = actual
		dashboardTargetData.value.target_value = benefitData.value.target_savings_value;
		dashboardTargetData.value.estimated_value = dashboardProjectPipeline.value.estimated_savings_value;
		dashboardTargetData.value.actual_value = dashboardProjectPipeline.value.actual_savings_value;
		dashboardTargetData.value.gap_value = abbreviateNumber(gap);

		dashboardTargetData.value.valueData = [
			// { name: 'Target', value: target },
			{ name: "Delivered", value: actual },
			{ name: "Estimated", value: estimated },
			{ name: "Gap", value: gap },
		];

		activityStatusValues.value = res.data?.status_of_activity;

		let Obj: any = {};
		Object.entries(res.data?.project_pipeline).map(([key, value]) => {
			return (Obj[key] = value);
		});

		projectPipelineValues.value = Obj;

		let dataObj: any = {};
		Object.entries(res.data?.project_pipeline).map(([key, value]) => {
			if (key != "total_request" && key != "work_in_progress") {
				return (dataObj[key] = value);
			}
		});
		dashboardProjectPipelineData.value = dataObj;
	} catch {
	} finally {
		fullscreenLoading.value = false;
	}
};

const getRolId = computed(() => {
	return authStore.getRoleId;
});

const exportFile = () => {
	exportLoading.value = true;

	const dom: any = document.getElementById("dashboardExportDiv");

	const options = {
		backgroundColor: "#ffffff",
	};

	const d = dom.querySelectorAll(".top-header-export");

	d.forEach((e: any) => {
		e?.classList.remove("hidden");
	});

    const iconClass = dom.querySelectorAll(".benefits-icon");

    iconClass.forEach((e: any) => {
        e?.classList.add("-mt-8");
    });


	let width = 285;
	let height = 190;

	// if(window.screen.width > 767 && window.screen.width <= 1200) {
	//     width = 280;
	//     height = 300;
	// } else if(window.screen.width > 1200 && window.screen.width <= 1366) {
	//     width = 280;
	//     height = 270;
	// } else if(window.screen.width > 1366 && window.screen.width <= 1536) {
	//     width = 280;
	//     height = 220;
	// } else if(window.screen.width > 1920 && window.screen.width <= 2560) {
	//     width = 280;
	//     height = 160;
	// }

	let fileName = "Dashboard-" + getProfileData?.value?.user_detail?.company?.company_name + "-" + moment().format("DD-MM-YYYY-hh.mm") + ".pdf";

	html2canvas(dom, options)
		.then(function (canvas) {
			var doc = new jsPDF({ orientation: "l", format: "a4" });
			doc.addImage(canvas, 5, 5, width, height);
			doc.save(fileName);
		})
		.catch(function (error: any) {
			console.error("oops, something went wrong!", error);
		})
		.finally(() => {
			exportLoading.value = false;
			d.forEach((e: any) => {
				e.classList.add("hidden");
			});
            iconClass.forEach((e: any) => {
				e.classList.remove("-mt-8");
			});
		});
};

const getDashboardItems = (id: any) => {
	if (id === "suppliers") {
		return (
			roleId.value == "client_admin" ||
			(roleId.value == "client_user" && (hasPermissionTo("suppliers-admin-view-all") || hasPermissionTo("suppliers-admin-view")))
		);
	} else if (id === "contracts") {
		return (
			roleId.value == "client_admin" ||
			roleId.value == "supplier_admin" ||
			roleId.value == "supplier_user" ||
			(roleId.value == "client_user" && (hasPermissionTo("contracts-view-all") || hasPermissionTo("contracts-view")))
		);
	} else if (id === "requests") {
		return (
			roleId.value == "client_admin" ||
			(roleId.value == "client_user" && (hasPermissionTo("request-view-all") || hasPermissionTo("request-view")))
		);
	} else if (id === "projects") {
		return (
			roleId.value == "client_admin" ||
			(roleId.value == "client_user" && (hasPermissionTo("project-view-all") || hasPermissionTo("project-view")))
		);
	}

	return true;
};

const handlePipelineClick = (status: any) => {
	navigateTo(
		localePath({
			path: "/project-pipeline/requests",
			query: { requestStatus: status },
		}),
		{ replace: true }
	);
};

const handleStatusActivityClick = (status: any) => {
	navigateTo(
		localePath({
			path: "/project-pipeline/projects",
			query: { projectStatus: status },
		}),
		{ replace: true }
	);
};

const handleSupplierStatusClick = (status: any) => {
	navigateTo(
		localePath({
			path: "/supplier-admins",
			query: { status: status },
		}),
		{ replace: true }
	);
};
</script>

<template>
	<div class="dashboard p-3 pt-1 bg-white" v-loading="exportLoading">
		<div class="text-right">
			<el-tooltip :content="$t('buttons.export')" placement="top">
				<a class="cursor-pointer text-primary underline" @click="exportFile"
					v-if="roleId == 'client_admin' || roleId == 'client_user'">
                    Export Dashboard
                </a>
			</el-tooltip>
		</div>

		<div class="-mx-2 hidden" id="dashboard1">
			<table style="border-collapse: collapse;" class="w-full table-fixed" cellspacing="20"
				v-if="roleId == 'client_admin' || roleId == 'client_user'">
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr style="height:1px">
					<td valign="middle" class="p-2" colspan="4">
						<table class="w-full h-full bg-blue/10 rounded-lg">
							<tr>
								<td class="p-4">
									<h5 class="text-gray-800 text-xl font-bold" :title="$t('header.savings_target')">
										{{ $t("header.savings_target") }}
									</h5>
									<h3 class="text-blue text-[32px] font-semibold"
										:title="benefitData.target_savings ?? 0">
										{{ CurrencySymbole[benefitData.target_savings_currency] }}
										{{ benefitData.target_savings_value || 0 }}
									</h3>
								</td>
								<td style="vertical-align:middle" class="text-right p-4">
									<i class="fa-solid fa-bullseye text-7xl text-blue/30 inline-block"></i>
								</td>
							</tr>
						</table>
					</td>
					<td valign="top" class="p-2 h-full" colspan="4">
						<div
							class="p-4 bg-amber/10 rounded-lg relative overflow-hidden flex items-center justify-between">
							<div class="details relative inline-block">
								<h5 class="text-gray-800 text-xl font-bold" :title="$t('header.estimated_savings')">
									{{ $t("header.estimated_savings") }}
								</h5>
								<h3 class="text-amber text-[32px] font-semibold"
									:title="dashboardProjectPipeline.estimated_savings ?? 0">
									{{ CurrencySymbole[benefitData.target_savings_currency] }}
									{{ dashboardProjectPipeline.estimated_savings_value ?? 0 }}
								</h3>
							</div>
							<i class="fa-solid fa-hand-holding-dollar text-7xl text-amber/30"></i>
						</div>
					</td>
					<td valign="top" class="p-2 h-full" colspan="4">
						<div
							class="p-4 bg-success/10 rounded-lg relative overflow-hidden flex items-center justify-between">
							<div class="details relative inline-block">
								<h5 class="text-gray-800 text-xl font-bold" :title="$t('header.savings_delivered')">
									{{ $t("header.savings_delivered") }}
								</h5>
								<h3 class="text-success text-[32px] font-semibold"
									:title="dashboardProjectPipeline.actual_savings ?? 0">
									{{ CurrencySymbole[benefitData.target_savings_currency] }}
									{{ dashboardProjectPipeline.actual_savings_value ?? 0 }}
								</h3>
							</div>
							<i class="fa-solid fa-hands-holding text-7xl text-success/30"></i>
						</div>
					</td>
				</tr>
				<tr style="height:1px">
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="savings_status flex flex-col h-full">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.savings_status") }}
							</h3>

							<div class="border border-gray-100 rounded-lg bg-gray-50 grow">
								<dashboard-target-chart :data="dashboardTargetData"
									:show-label="false"></dashboard-target-chart>
								<h3 class="text-gray-800 text-md font-bold text-center mt-2">
									{{ $t("header.savings_target") }} - {{
										CurrencySymbole[benefitData.target_savings_currency] }}
									{{ dashboardTargetData.target_value }}
								</h3>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="project-pipeline rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('requests')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.project_pipeline") }}
							</h3>
							<div class="grid grid-cols-2 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
								<div class="box h-[105px] bg-success/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details relative">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('header.approved')">
											{{ $t("header.approved") }}
										</h5>
										<h3 class="text-success text-[40px] font-bold inline-block cursor-pointer"
											:title="dashboardProjectPipelineData.approved ?? 0"
											@click="handlePipelineClick(2)">
											{{ dashboardProjectPipelineData.approved ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box h-[105px] bg-amber/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details relative">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('header.awaited')">
											{{ $t("header.awaited") }}
										</h5>
										<h3 class="text-amber text-[40px] font-bold inline-block cursor-pointer"
											:title="dashboardProjectPipelineData.awaited ?? 0"
											@click="handlePipelineClick(1)">
											{{ dashboardProjectPipelineData.awaited ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box h-[105px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details relative">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('header.hold')">
											{{ $t("header.hold") }}
										</h5>
										<h3 class="text-blue text-[40px] font-bold inline-block cursor-pointer"
											:title="activityStatusValues.on_hold ?? 0" @click="handlePipelineClick(3)">
											{{ activityStatusValues.on_hold ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box h-[105px] bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details relative">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('header.rejected')">
											{{ $t("header.rejected") }}
										</h5>
										<h3 class="text-danger text-[40px] font-bold inline-block cursor-pointer"
											:title="dashboardProjectPipelineData.rejected ?? 0"
											@click="handlePipelineClick(5)">
											{{ dashboardProjectPipelineData.rejected ?? 0 }}
										</h3>
									</div>
								</div>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="activity-status rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('projects')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.activity_status") }}
							</h3>
							<div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
								<div class="box bg-teal/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.sourcing')">
											{{ $t("chartLabels.sourcing") }}
										</h5>
										<h3 class="text-teal text-[22px] font-bold cursor-pointer"
											:title="activityStatusValues.sourcing ?? 0"
											@click="handleStatusActivityClick(3)">
											{{ activityStatusValues.sourcing ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-grey/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold"
											:title="$t('chartLabels.selection')">
											{{ $t("chartLabels.selection") }}
										</h5>
										<h3 class="text-grey text-[22px] font-bold cursor-pointer"
											:title="activityStatusValues.selection ?? 0"
											@click="handleStatusActivityClick(4)">
											{{ activityStatusValues.selection ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-teal/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.signing')">
											{{ $t("chartLabels.signing") }}
										</h5>
										<h3 class="text-teal text-[22px] font-bold cursor-pointer"
											:title="activityStatusValues.signing ?? 0"
											@click="handleStatusActivityClick(5)">
											{{ activityStatusValues.signing ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-grey/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold"
											:title="$t('chartLabels.supervision')">
											{{ $t("chartLabels.supervision") }}
										</h5>
										<h3 class="text-grey text-[22px] font-bold cursor-pointer"
											:title="activityStatusValues.supervision ?? 0"
											@click="handleStatusActivityClick(6)">
											{{ activityStatusValues.supervision ?? 0 }}
										</h3>
									</div>
								</div>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="outstanding-compliance rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('suppliers')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.outstanding_compliance") }}
							</h3>

							<div class="border border-gray-100 rounded-lg bg-gray-50 overflow-hidden grow">
								<dashboard-outstanding-chart :data="outstandingComplianceData"
									:show-label="showLabel"></dashboard-outstanding-chart>
								<h3 class="text-center text-md font-bold">
									{{ $t("header.contracted_suppliers") }} - {{ outstandingComplianceData?.total }}
								</h3>
							</div>
						</div>
					</td>
				</tr>
				<tr style="height:1px">
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="contract-notice-period rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('contracts')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.contract_notice_period") }}
							</h3>

							<div class="border border-gray-100 rounded-lg bg-gray-50 grow">
								<dashboard-contract-notice-period-chart :data="contractNoticePeriodValues"
									:dataKeys="contractNoticePeriodKeys" class="-mt-10"
									:show-label="showLabel"></dashboard-contract-notice-period-chart>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="contract-expiring rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('contracts')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.contract_expiring") }}
							</h3>

							<div class="border border-gray-100 rounded-lg bg-gray-50 grow">
								<dashboard-contract-expiring-chart :data="contractExpiringValues" class="-mt-10"
									:show-label="showLabel"></dashboard-contract-expiring-chart>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div class="contract-validation rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('contracts')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.contract_validation") }}
							</h3>
							<div class="border border-gray-100 rounded-lg bg-gray-50 overflow-hidden grow">
								<div class="hidden hideshow mb-1 mt-3">
									<ul class="flex flex-wrap justify-center gap-2">
										<li class="text-xs" v-for="validation in contractValidationsValues"
											:key="validation.id">
											{{ validation.name }} : {{ validation.value == 0.3 ? 0 : validation.value }}
										</li>
									</ul>
								</div>
								<dashboard-contract-validation-chart :data="contractValidationsValues"
									:show-label="showLabel"></dashboard-contract-validation-chart>
							</div>
						</div>
					</td>
					<td valign="top" style="height:inherit" class="p-2" colspan="3">
						<div id="supplier-status" class="supplier-status rounded-lg flex flex-col h-full"
							v-if="getDashboardItems('suppliers')">
							<h3 class="text-[18px] font-semibold mb-1">
								{{ $t("header.supplier_status") }}
							</h3>
							<div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
								<div class="box bg-[#008000]/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.sourcing')">
											{{ $t("chartLabels.approved_contracted") }}
										</h5>
										<h3 class="text-[#008000] text-[22px] font-bold cursor-pointer"
											:title="supplierStatusValues.approved_contracted ?? 0"
											@click="handleSupplierStatusClick(3)">
											{{ supplierStatusValues.approved_contracted ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-[#ff8e28]/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold"
											:title="$t('chartLabels.selection')">
											{{ $t("chartLabels.approved_uncontracted") }}
										</h5>
										<h3 class="text-[#ff8e28] text-[22px] font-bold cursor-pointer"
											:title="supplierStatusValues.approved_uncontracted ?? 0"
											@click="handleSupplierStatusClick(4)">
											{{ supplierStatusValues.approved_uncontracted ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.signing')">
											{{ $t("chartLabels.unapproved_contracted") }}
										</h5>
										<h3 class="text-danger text-[22px] font-bold cursor-pointer"
											:title="supplierStatusValues.unapproved_contracted ?? 0"
											@click="handleSupplierStatusClick(2)">
											{{ supplierStatusValues.unapproved_contracted ?? 0 }}
										</h3>
									</div>
								</div>
								<div class="box bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
									<div class="details flex justify-between items-center">
										<h5 class="text-gray-900 text-lg font-bold"
											:title="$t('chartLabels.supervision')">
											{{ $t("chartLabels.unapproved_uncontracted") }}
										</h5>
										<h3 class="text-danger text-[22px] font-bold cursor-pointer"
											:title="supplierStatusValues.uncontracted_unapproved ?? 0"
											@click="handleSupplierStatusClick(1)">
											{{ supplierStatusValues.uncontracted_unapproved ?? 0 }}
										</h3>
									</div>
								</div>
							</div>
						</div>
					</td>
				</tr>
			</table>
		</div>

		<div id="dashboardExportDiv" v-if="roleId == 'client_admin' || roleId == 'client_user'">
			<div class="hidden hideshow top-header-export -mt-3 mb-12 text-center">
				<span class="text-gray-800 font-bold text-2xl" v-if="getProfileData?.user_detail?.company?.company_name">
					{{ getProfileData?.user_detail?.company?.company_name }} - {{ moment().format("DD-MM-YYYY hh:mm A")
					}}
				</span>
			</div>

            <!-- skeleton  -->
            <template v-if="fullscreenLoading">
                <div class="benefits grid md:grid-cols-3 grid-cols-1 gap-5 mb-5">
                    <div class="p-4 bg-blue/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="w-10/12">
                            <el-skeleton animated :rows="1" />
                        </div>
                        <el-skeleton animated class="text-right" style="--el-skeleton-circle-size: 70px">
                            <template #template>
                                <el-skeleton-item variant="circle" />
                            </template>
                        </el-skeleton>
                    </div>
                    <div class="p-4 bg-blue/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="w-10/12">
                            <el-skeleton animated :rows="1" />
                        </div>
                        <el-skeleton animated class="text-right" style="--el-skeleton-circle-size: 70px">
                            <template #template>
                                <el-skeleton-item variant="circle" />
                            </template>
                        </el-skeleton>
                    </div>
                    <div class="p-4 bg-blue/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="w-10/12">
                            <el-skeleton animated :rows="1" />
                        </div>
                        <el-skeleton animated class="text-right" style="--el-skeleton-circle-size: 70px">
                            <template #template>
                                <el-skeleton-item variant="circle" />
                            </template>
                        </el-skeleton>
                    </div>
                </div>

                <div class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mb-6">
                    <div class="">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 240px;" class="rounded-lg" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="grid grid-cols-2 gap-2 border border-gray-100 rounded-lg bg-gray-50 px-2 pt-3" v-if="getDashboardItems('requests')">
                        <div class="box h-[100px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
                            <el-skeleton animated :rows="1"></el-skeleton>
                        </div>
                        <div class="box h-[100px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
                            <el-skeleton animated :rows="1"></el-skeleton>
                        </div>
                        <div class="box h-[100px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
                            <el-skeleton animated :rows="1"></el-skeleton>
                        </div>
                        <div class="box h-[100px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
                            <el-skeleton animated :rows="1"></el-skeleton>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 px-2 pt-3" v-if="getDashboardItems('projects')">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="" v-if="getDashboardItems('suppliers')">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 240px;" class="bg-gray-200 rounded-lg" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="flex justify-between gap-5 border border-gray-100 rounded-lg bg-gray-50 p-2" v-if="getDashboardItems('contracts')">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="flex justify-between gap-5 border border-gray-100 rounded-lg bg-gray-50 py-2 px-10" v-if="getDashboardItems('contracts')">
                        <el-skeleton animated class="text-center">
                            <template #template>
                                <el-skeleton-item style="width: 70%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated class="text-center">
                            <template #template>
                                <el-skeleton-item style="width: 70%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated class="text-center">
                            <template #template>
                                <el-skeleton-item style="width: 70%; height: 230px;" class="rounded-t-full" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="" v-if="getDashboardItems('contracts')">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 240px;" class="bg-gray-200 rounded-lg" />
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 px-2 pt-3" v-if="getDashboardItems('suppliers')">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item style="width: 100%; height: 40px;" class="" />
                            </template>
                        </el-skeleton>
                    </div>
                </div>
            </template>

            <!-- main dashboard -->
            <template v-else>
                <div class="benefits grid md:grid-cols-3 grid-cols-1 gap-5 mb-5">
                    <div class="p-4 bg-blue/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="details relative">
                            <h5 class="text-gray-800 text-xl font-bold" :title="$t('header.savings_target')">
                                {{ $t("header.savings_target") }}
                            </h5>
                            <h3 class="text-blue text-[32px] font-semibold" :title="benefitData.target_savings_value ?? 0">
                                {{ CurrencySymbole[benefitData.target_savings_currency] }}
                                {{ benefitData.target_savings_value || 0 }}
                            </h3>
                        </div>
                        <i class="fa-solid fa-bullseye text-7xl text-blue/30 benefits-icon"></i>
                    </div>
                    <div class="p-4 bg-amber/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="details relative inline-block">
                            <h5 class="text-gray-800 text-xl font-bold" :title="$t('header.estimated_savings')">
                                {{ $t("header.estimated_savings") }}
                            </h5>
                            <h3 class="text-amber text-[32px] font-semibold"
                                :title="dashboardProjectPipeline.estimated_savings_value ?? 0">
                                {{ CurrencySymbole[benefitData.target_savings_currency] }}
                                {{ dashboardProjectPipeline.estimated_savings_value ?? 0 }}
                            </h3>
                        </div>
                        <i class="fa-solid fa-hand-holding-dollar text-7xl text-amber/30 benefits-icon"></i>
                    </div>
                    <div class="p-4 bg-success/10 rounded-lg relative overflow-hidden flex items-center justify-between">
                        <div class="details relative inline-block">
                            <h5 class="text-gray-800 text-xl font-bold" :title="$t('header.savings_delivered')">
                                {{ $t("header.savings_delivered") }}
                            </h5>
                            <h3 class="text-success text-[32px] font-semibold"
                                :title="dashboardProjectPipeline.actual_savings_value ?? 0">
                                {{ CurrencySymbole[benefitData.target_savings_currency] }}
                                {{ dashboardProjectPipeline.actual_savings_value ?? 0 }}
                            </h3>
                        </div>
                        <i class="fa-solid fa-hands-holding text-7xl text-success/30 benefits-icon"></i>
                    </div>
                </div>

                <div class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mb-6">
                    <div class="savings_status flex flex-col">
                        <h3 class="text-[18px] font-semibold mb-1">
                            {{ $t("header.savings_status") }}
                        </h3>

                        <div class="border border-gray-100 rounded-lg bg-gray-50 grow">
                            <dashboard-target-chart :data="dashboardTargetData"
                                :show-label="false"></dashboard-target-chart>
                            <h3 class="text-gray-800 text-md font-bold text-center mt-2">
                                {{ $t("header.savings_target") }} - {{ CurrencySymbole[benefitData.target_savings_currency]
                                }}
                                {{ dashboardTargetData.target_value }}
                            </h3>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('requests')">
                        <div class="project-pipeline rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.project_pipeline") }}
                            </h3>
                            <div class="grid grid-cols-2 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
                                <div class="box h-[105px] bg-success/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details relative">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('header.approved')">
                                            {{ $t("header.approved") }}
                                        </h5>
                                        <h3 class="text-success text-[40px] font-bold inline-block cursor-pointer"
                                            :title="dashboardProjectPipelineData.approved ?? 0" @click="handlePipelineClick(2)">
                                            {{ dashboardProjectPipelineData.approved ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box h-[105px] bg-amber/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details relative">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('header.awaited')">
                                            {{ $t("header.awaited") }}
                                        </h5>
                                        <h3 class="text-amber text-[40px] font-bold inline-block cursor-pointer"
                                            :title="dashboardProjectPipelineData.awaited ?? 0" @click="handlePipelineClick(1)">
                                            {{ dashboardProjectPipelineData.awaited ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box h-[105px] bg-blue/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details relative">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('header.hold')">
                                            {{ $t("header.hold") }}
                                        </h5>
                                        <h3 class="text-blue text-[40px] font-bold inline-block cursor-pointer"
                                            :title="activityStatusValues.on_hold ?? 0" @click="handlePipelineClick(3)">
                                            {{ activityStatusValues.on_hold ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box h-[105px] bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details relative">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('header.rejected')">
                                            {{ $t("header.rejected") }}
                                        </h5>
                                        <h3 class="text-danger text-[40px] font-bold inline-block cursor-pointer"
                                            :title="dashboardProjectPipelineData.rejected ?? 0" @click="handlePipelineClick(5)">
                                            {{ dashboardProjectPipelineData.rejected ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('projects')">
                        <div class="activity-status rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.activity_status") }}
                            </h3>
                            <div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
                                <div class="box bg-teal/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.sourcing')">
                                            {{ $t("chartLabels.sourcing") }}
                                        </h5>
                                        <h3 class="text-teal text-[22px] font-bold cursor-pointer"
                                            :title="activityStatusValues.sourcing ?? 0" @click="handleStatusActivityClick(3)">
                                            {{ activityStatusValues.sourcing ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-grey/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.selection')">
                                            {{ $t("chartLabels.selection") }}
                                        </h5>
                                        <h3 class="text-grey text-[22px] font-bold cursor-pointer"
                                            :title="activityStatusValues.selection ?? 0" @click="handleStatusActivityClick(4)">
                                            {{ activityStatusValues.selection ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-teal/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.signing')">
                                            {{ $t("chartLabels.signing") }}
                                        </h5>
                                        <h3 class="text-teal text-[22px] font-bold cursor-pointer"
                                            :title="activityStatusValues.signing ?? 0" @click="handleStatusActivityClick(5)">
                                            {{ activityStatusValues.signing ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-grey/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.supervision')">
                                            {{ $t("chartLabels.supervision") }}
                                        </h5>
                                        <h3 class="text-grey text-[22px] font-bold cursor-pointer"
                                            :title="activityStatusValues.supervision ?? 0"
                                            @click="handleStatusActivityClick(6)">
                                            {{ activityStatusValues.supervision ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('suppliers')">
                        <div class="outstanding-compliance rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.outstanding_compliance") }}
                            </h3>

                            <div class="border border-gray-100 rounded-lg bg-gray-50 overflow-hidden grow">
                                <dashboard-outstanding-chart :data="outstandingComplianceData"
                                    :show-label="showLabel"></dashboard-outstanding-chart>
                                <h3 class="text-center text-md font-bold">
                                    {{ $t("header.contracted_suppliers") }} - {{ outstandingComplianceData?.total }}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('contracts')">
                        <div class="contract-notice-period rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.contract_notice_period") }}
                            </h3>

                            <div class="border border-gray-100 rounded-lg bg-gray-50 grow">
                                <dashboard-contract-notice-period-chart :data="contractNoticePeriodValues"
                                    :dataKeys="contractNoticePeriodKeys" class="-mt-10"
                                    :show-label="showLabel"></dashboard-contract-notice-period-chart>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('contracts')">
                        <div class="contract-expiring rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.contract_expiring") }}
                            </h3>

                            <div class="border border-gray-100 rounded-lg bg-gray-50 grow">
                                <dashboard-contract-expiring-chart :data="contractExpiringValues" class="-mt-10"
                                    :show-label="showLabel"></dashboard-contract-expiring-chart>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('contracts')">
                        <div class="contract-validation rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.contract_validation") }}
                            </h3>
                            <div class="border border-gray-100 rounded-lg bg-gray-50 overflow-hidden grow">
                                <div class="hidden hideshow mb-1 mt-3">
                                    <ul class="flex flex-wrap justify-center gap-2">
                                        <li class="text-xs" v-for="validation in contractValidationsValues"
                                            :key="validation.id">
                                            {{ validation.name }} : {{ validation.value == 0.3 ? 0 : validation.value }}
                                        </li>
                                    </ul>
                                </div>
                                <dashboard-contract-validation-chart :data="contractValidationsValues"
                                    :show-label="showLabel"></dashboard-contract-validation-chart>
                            </div>
                        </div>
                    </div>

                    <div v-if="getDashboardItems('suppliers')">
                        <div id="supplier-status" class="supplier-status rounded-lg flex flex-col">
                            <h3 class="text-[18px] font-semibold mb-1">
                                {{ $t("header.supplier_status") }}
                            </h3>
                            <div class="grid grid-cols-1 gap-2 border border-gray-100 rounded-lg bg-gray-50 p-2 grow">
                                <div class="box bg-[#008000]/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.sourcing')">
                                            {{ $t("chartLabels.approved_contracted") }}
                                        </h5>
                                        <h3 class="text-[#008000] text-[22px] font-bold cursor-pointer"
                                            :title="supplierStatusValues.approved_contracted ?? 0"
                                            @click="handleSupplierStatusClick(3)">
                                            {{ supplierStatusValues.approved_contracted ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-[#ff8e28]/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.selection')">
                                            {{ $t("chartLabels.approved_uncontracted") }}
                                        </h5>
                                        <h3 class="text-[#ff8e28] text-[22px] font-bold cursor-pointer"
                                            :title="supplierStatusValues.approved_uncontracted ?? 0"
                                            @click="handleSupplierStatusClick(4)">
                                            {{ supplierStatusValues.approved_uncontracted ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.signing')">
                                            {{ $t("chartLabels.unapproved_contracted") }}
                                        </h5>
                                        <h3 class="text-danger text-[22px] font-bold cursor-pointer"
                                            :title="supplierStatusValues.unapproved_contracted ?? 0"
                                            @click="handleSupplierStatusClick(2)">
                                            {{ supplierStatusValues.unapproved_contracted ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="box bg-danger/10 rounded-lg relative overflow-hidden gap-2 p-2">
                                    <div class="details flex justify-between items-center">
                                        <h5 class="text-gray-900 text-lg font-bold" :title="$t('chartLabels.supervision')">
                                            {{ $t("chartLabels.unapproved_uncontracted") }}
                                        </h5>
                                        <h3 class="text-danger text-[22px] font-bold cursor-pointer"
                                            :title="supplierStatusValues.uncontracted_unapproved ?? 0"
                                            @click="handleSupplierStatusClick(1)">
                                            {{ supplierStatusValues.uncontracted_unapproved ?? 0 }}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

		</div>

		<!-- show dashboard image -->
		<div class="bg-[#fff] items-center justify-center h-full w-full" v-else>
			<NuxtImg format="webp" class="w-full" src="/images/Dashboard.webp" alt="dashboard" />
		</div>
	</div>
</template>

<style lang="css" scoped>
	.el-skeleton {
		--el-skeleton-color: rgba(150, 150, 150, 0.6);
		--el-skeleton-to-color: rgba(150, 150, 150, 0.9);
	}
</style>
