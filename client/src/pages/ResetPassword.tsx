import { useState } from "react";
import { useForm } from "react-hook-form"
import { TextInput } from "../components/TextInput";
import { Loading } from "../components/Loading";
import { CustomButton } from "../components/CustomButton";
import { ErrMsg } from "../types";
import { apiRequest } from "../utils";

export const ResetPassword = () => {

    const [errMsg, setErrMsg] = useState<ErrMsg>({
        message: "",
        status: ""
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const {register, handleSubmit, formState:{ errors } } = useForm({ mode: "onChange"});

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);

        try {
            const res = await apiRequest({
                url: "/users/request-passwordreset",
                data:data,
                method: "POST",
            });

            if (res.status === "failed") {
                setErrMsg(res);
            } else {
                setErrMsg(res);
            }
            setIsSubmitting(false);
        } catch (error) {
            console.log(error);
            setIsSubmitting(false);
        }
        
    }
    return (
        <div className="w-full h-[100vh] bg-bgColor flex items-center justify-center p-6 ">
            <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg">
                <p className="text-ascent-1 text-lg font-semibold">Email Address</p>

                <span className="test-sm text-ascent-2">
                    Enter email address used during registration
                </span>

                <form 
                    onSubmit={handleSubmit(onSubmit)}  
                    className="py-4 flex flex-col gap-5"
                >
                    <TextInput 
                        name="Email"
                        label="Email"
                        placeholder="email@example.com"
                        type="email"
                        register={register('email', {
                            required: "Email address is required..!"
                        })}
                        styles={`w-full rounded-lg`}
                        labelStyles={`ml-2`}
                        error={errors.email ? String(errors.email.message) : ''}  
                    />
                    
                    {errMsg?.message && (
                                <span 
                                    className={`text-sm ${
                                        errMsg.status == 'failed'
                                        ? "text-[#f64949fe]"
                                        : "text-[#2ba150fe]"
                                    } mt-0.5`}>
                                        {errMsg.message}
                                </span>
                    )}
                    {isSubmitting ? (
                        <Loading/>
                    ) : 
                        <CustomButton
                        type="submit" 
                        title={"Submit"}
                        containerStyles={`inline flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                    />}
                </form>
            </div>

        </div>
    )
}