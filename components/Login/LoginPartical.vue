<template>
	<div>
		<vue-particles id="tsparticles" :options="options" :particles-init="particlesInit" />
	</div>
</template>
<script>
	import { loadFull } from "tsparticles";

	export default {
		name: "NuxtTutorial",
		data() {
			return {
				options: {
					background: {
						color: {
							value: "#290C2D",
						},
					},
					fullScreen: {
						enable: true,
						zIndex: -1,
					},
					fpsLimit: 120,
					interactivity: {
						events: {
							onClick: {
								enable: true,
								mode: "push",
							},
							// onHover: {
							//   enable: true,
							//   mode: "repulse",
							// },
							resize: true,
						},
						modes: {
							// bubble: {
							//   distance: 400,
							//   duration: 2,
							//   opacity: 0.8,
							//   // size: 40,
							// },
							push: {
								quantity: 3,
							},
							repulse: {
								distance: 200,
								duration: 0.4,
							},
						},
					},
					particles: {
						color: {
							value: "#7e7db4",
						},
						links: {
							color: "#1294a8",
							distance: 150,
							enable: true,
							opacity: 0.8,
							width: 1,
						},
						collisions: {
							enable: true,
						},
						move: {
							direction: "none",
							enable: true,
							outMode: "bounce",
							random: false,
							speed: 0.5,
							straight: false,
						},
						number: {
							density: {
								enable: true,
								area: 1400,
							},
							value: 100,
						},
						opacity: {
							value: 1,
						},
						shape: {
							// type: "circle",
						},
						size: {
							random: true,
							value: 4,
						},
					},
					detectRetina: true,
				},
			};
		},
		methods: {
			particlesInit: async (engine) => {
				await loadFull(engine);
			},
		},
	};
</script>
<style>
	.bg-[#fff] {
		background: none !important;
	}
</style>
