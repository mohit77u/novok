<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { loadScript } from "~/utils/scripts";

	const props = defineProps({
		address: {
			type: String,
			default: "",
		},
		id: {
			type: String,
			default: "",
		},
		label: {
			type: String,
			default: "",
		},
		placeholder: {
			type: String,
			default: "",
		},
		required: {
			type: Boolean,
			default: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
        maxLength: {
			type: String,
			default: "100",
            required: false,
		},
	});

	const config = useRuntimeConfig();
	const emits = defineEmits(["getAddress", "changed_address"]);

	const formData = reactive({
		address: "",
	});

	watch(
		() => props.address,
		(currData: any) => {
			formData.address = currData;
		},
		{ deep: true, immediate: true }
	);

	// onMounted(() => {
	// 	loadScript(`https://maps.googleapis.com/maps/api/js?key=${config.public.google_place_api_key}&libraries=places`, () => {
	// 		GetGoogleAddress();
	// 	});
	// });

	// const GetAutoComplete = () => {
	//   let input = document.getElementById(props.id);

	//   const google = (window as any).google;
	//   const autocompleteService = new google.maps.places.Autocomplete(input);
	// };

	const focusOnAddress = () => {
		loadScript(`https://maps.googleapis.com/maps/api/js?key=${config.public.google_place_api_key}&libraries=places`, () => {
			GetGoogleAddress();
		});
	};

	const GetGoogleAddress = () => {
		// let components: any = {};
		const input = document.getElementById(props.id);

		const google = (window as any).google;
		const autocompleteService = new google.maps.places.Autocomplete(input);

		google.maps.event.addListener(autocompleteService, "place_changed", function () {
			const place = autocompleteService.getPlace();

			const data = getAddressObject(place.address_components);

			formData.address = data.home + " " + data.street + " " + data.area || "";
			emits("getAddress", data, formData.address, props.id);
		});
	};

	const getAddressObject = (addressComponents: any) => {
		const ShouldBeComponent: any = {
			home: ["street_number"],
			postal_code: ["postal_code"],
			street: ["street_address", "route"],
			region: [
				"administrative_area_level_1",
				"administrative_area_level_2",
				"administrative_area_level_3",
				"administrative_area_level_4",
				"administrative_area_level_5",
			],
			city: ["locality"],
			area: ["sublocality", "sublocality_level_1", "sublocality_level_2", "sublocality_level_3", "sublocality_level_4"],
			country: ["country"],
		};

		const address: any = {
			home: "",
			postal_code: "",
			street: "",
			region: "",
			city: "",
			area: "",
			country: "",
		};
		addressComponents.forEach((component: any) => {
			Object.keys(ShouldBeComponent).forEach((shouldBe: any) => {
				// eslint-disable-next-line unicorn/prefer-includes
				if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
					address[shouldBe] = component.long_name;
				}
			});
		});
		return address;
	};

	const onAddressChange = () => {
		emits("changed_address", formData.address, props.id);
	};
</script>

<template>
	<el-form-item :label="label" :rules="[{ required: required }]" class="mb-0">
		<div class="el-input" :class="disabled ? 'is-disabled' : ''">
			<div class="el-input__wrapper">
			<input
				:id="id"
				ref="autocompleteInput"
				v-model="formData.address"
				class="w-full outline-none el-input__inner focus:border-primary text-dark"
				type="text"
				:disabled="disabled"
				:placeholder="placeholder"
                :maxLength="maxLength"
				@focus="focusOnAddress"
				@change="onAddressChange"
			/>
		</div>
		</div>
	</el-form-item>
</template>
