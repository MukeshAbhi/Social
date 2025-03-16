import { useState } from "react"
import { TextInput } from "../components/TextInput";
import { useForm } from "react-hook-form";
import { CustomButton } from "../components/CustomButton";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";


export const ChangePassword = () => {

    const {register, handleSubmit, formState:{ errors }, getValues} = useForm({mode: "onChange"});
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("id");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    
    const onSubmit = async () => {
        const passwordValue = getValues("password");

        if (!userId) {
            alert("Invalid link");
            return;
        }
        
        setLoading(true);
       
            try {
                console.log("here")
                const ressponse = await axios.post(`${API_URL}users/reset-password`,
                    {
                        userId,
                        password: passwordValue
                    });
                const url = ressponse.data.redirectUrl;
                console.log(url);
                navigate(url);
              } catch (error) {
                console.error(error);
                navigate("/users/reset-status?status=error&message=Something went wrong");
              }
              setLoading(false);
};    
    

    return(
        <div className="w-full h-[100vh] bg-bgColor flex items-center justify-center p-6 ">
            <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg">
                <p className="text-ascent-1 text-2xl font-semibold ">Password</p>

                <form 
                    onSubmit={handleSubmit(onSubmit)}  
                    className="py-4 flex flex-col gap-5 "
                >
                    <TextInput 
                        name="password"
                        type="password"
                        placeholder="Password"
                        register={
                            register("password", {
                                required: "Password required"
                            })
                        }
                        styles={`w-full rounded-lg`}
                        error= {errors.password ? String(errors.password.message) : ""}
                    />
                    <TextInput 
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        register={
                            register("confirmPassword", {
                                validate: (value) => {
                                    const { password } = getValues();
                                    if (password != value) {
                                        return "Password do not match"
                                    }
                                }
                            })
                        }
                        styles={`w-full rounded-lg`}
                        error= {errors.confirmPassword ? String(errors.confirmPassword.message) : ""}
                    />
                    
                    
                    <CustomButton
                        type="submit" 
                        title={loading ? "Updating..." : "Reset Password"}
                        containerStyles={`inline flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                    />
                </form>
            </div>

        </div>
    )
}
 