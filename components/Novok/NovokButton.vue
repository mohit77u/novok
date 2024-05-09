<template>
	<el-button class="animation-btn">
		<span><slot /></span>
		<svg viewBox="-5 -5 110 110" preserveAspectRatio="none" aria-hidden="true">
			<path d="M0,0 C0,0 100,0 100,0 C100,0 100,100 100,100 C100,100 0,100 0,100 C0,100 0,0 0,0" />
		</svg>
	</el-button>
</template>

<style lang="scss" scoped>
	.el-button {
		& span {
			> svg {
				@at-root .el-button--info#{&} {
					fill: #1294a8;
				}
				@at-root .el-button--cyan#{&} {
					fill: #545152;
				}
				@at-root .btn-dark#{&} {
					fill: #545152;
				}
				@at-root .btn-white#{&} {
					fill: #ffff;
				}
				@at-root .el-button--danger#{&} {
					fill: #f87171;
				}
				@at-root .el-button--success#{&} {
					fill: #008000;
				}
				@at-root .el-button--sourcing#{&} {
					fill: #008000;
				}
				@at-root .el-button--selection#{&} {
					fill: #008080;
				}
				@at-root .el-button--signing#{&} {
					fill: #3f51b5;
				}
				@at-root .el-button--supervision#{&} {
					fill: #b5693f;
				}
				@at-root .el-button--onHold#{&} {
					fill: #ffa500;
				}
				@at-root .el-button--blue#{&} {
					fill: #3f51b5;
				}
			}
		}
	}
</style>
