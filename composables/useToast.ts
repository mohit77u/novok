import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";

export default (
    status: SweetAlertIcon,
    title: string,
    timer: number = 4000,
) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: timer,
        width: 500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
    });

    Toast.fire({
        icon: `${status}`,
        title: `${title}`,
    });
};
