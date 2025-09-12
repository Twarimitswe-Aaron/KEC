import { useFetchCsrfTokenQuery } from "../state/api/csrfApi";

export const useCsrfToken=()=>{
    const {data, refetch} =useFetchCsrfTokenQuery();
    const getToken=async ():Promise<string| undefined>=>{
        if (!data?.csrfToken){
            const res=await refetch();
            return res.data?.csrfToken;
        }

        return data?.csrfToken
    }
    return {getToken}
}