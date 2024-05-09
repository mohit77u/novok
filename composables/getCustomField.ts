import { useAuthStore } from "~/store/auth";
import useToast from "~/composables/useToast";

export async function getCustomField(module_name: string, tab_name: string) {
    try {
        const res: any = await useApiFetch(
            `/custom-fields?module_name=${module_name}&tab_name=${tab_name}`,
            {
                method: "GET",
            },
        );
        // If the response is successful, parse and return the data
        return res?.data;
    } catch (error: any) {}
}
