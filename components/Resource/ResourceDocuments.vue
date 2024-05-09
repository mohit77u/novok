<script setup lang="ts">
	import type { TabsPaneContext } from "element-plus";
	import moment from "moment";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Resources",
	});

	const emit = defineEmits(["edit-data", "delete-data"]);
	const config = useRuntimeConfig();
	const dialogVisible = ref(false);
	const deleteId = ref("");

	const props = defineProps({
		activeTab: {
			type: String,
			required: true,
		},
		documentsList: {
			type: Array,
			required: true,
		},
	});

	const router = useRouter();
	const route = useRoute();
	const localePath = useLocalePath();

	const editClick = (id: any) => {
		emit("edit-data", id);
	};

	const deleteClick = (id: any) => {
		dialogVisible.value = true;
		deleteId.value = id;
	};

	const deleteDocument = async () => {
		try {
			const res: any = await useApiFetch(`/resources/${deleteId.value}`, {
				method: "DELETE",
			});
			useToast("success", res.message);
			emit("delete-data");
			dialogVisible.value = false;
		} catch {
		} finally {
		}
	};

	const iconClick = (document: any) => {
		window.open(document);
	};

	const checkFileType = (extension: any) => {
		return extension === "pdf"
			? config.public.pdf_img_link
			: extension === "csv"
			? config.public.csv_img_link
			: extension === "xlsx"
			? config.public.xlsx_img_link
			: extension === "doc" || extension === "docs" || extension === "docx"
			? config.public.doc_img_link
			: extension === "png" || extension === "jpeg" || extension === "jpg"
			? config.public.doc_img_link
			: config.public.pdf_img_link;
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};
</script>

<template>
	<div class="resources p-4">
		<template v-if="documentsList.length">
			<div class="documents grid xxl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
				<div class="border-black/10 border rounded-xl" v-for="(document, index) in props.documentsList" :key="index">
					<div class="border-b border-black/10 p-4 flex items-start justify-between">
						<a
							:href="document.document_path"
							target="_blank"
							class="font-bold text-primary underline line-clamp-1"
							:title="document.document_name"
							>{{ document.document_name }}</a
						>

						<el-dropdown trigger="click" v-if="activeTab !== 'archive-documents'">
							<i
								v-if="hasPermissionTo('resource-edit') || hasPermissionTo('resource-delete')"
								class="fa-regular fa-ellipsis-vertical ml-2 cursor-pointer mt-1"
							></i>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item v-if="hasPermissionTo('resource-edit')" @click="editClick(document.id)"
										><i class="fa-fw fa-light fa-edit"></i>{{ $t("labels.edit") }}</el-dropdown-item
									>

									<el-dropdown-item v-if="hasPermissionTo('resource-delete')" @click="deleteClick(document.id)"
										><i class="fa-fw fa-light fa-trash"></i>{{ $t("labels.delete") }}</el-dropdown-item
									>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>

					<i
						class="fa-thin fa-image text-[63px] text-primary block p-4 text-center cursor-pointer"
						@click="iconClick(document.document_path)"
						v-if="
							document?.document_extension === 'png' ||
							document?.document_extension === 'jpeg' ||
							document?.document_extension === 'jpg'
						"
					></i>
					<NuxtImg
						class="cursor-pointer p-4 max-w-24 mx-auto"
						:alt="document.document_name"
						:src="checkFileType(document?.document_extension)"
						@click="iconClick(document.document_path)"
						v-else
					/>
					<div v-if="activeTab === 'archive-documents'" class="ml-3">
						<p>version : {{ document.document_version ? document.document_version : "-" }}</p>
						<p>Updated at : {{ document.updated_at ? moment(`${document.updated_at}`).format("DD/MM/YYYY") : "-" }}</p>
					</div>
				</div>
			</div>
		</template>
		<div v-else>
			<p class="text-center p-10">No documents found.</p>
		</div>

		<BaseDeleteModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:delete-api="deleteDocument"
			message-content="Are You sure you want to delete this document?"
			@dialog-ok-click="dialogOkClick"
		/>
	</div>
</template>
