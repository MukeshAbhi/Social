import { useForm } from "react-hook-form"
import { TextInput } from "../components/TextInput"
import { CustomButton } from "../components/CustomButton"
import { useState } from "react";
import { Link } from "react-router-dom";
import { ErrMsg } from "../types";
import { apiRequest } from "../utils";
import { Loading } from "../components/Loading";


export const Register = () => {
    

    const{register, handleSubmit, formState:{ errors}, getValues} = useForm({mode: "onChange"});
    
    const [errMsg, setErrMsg] = useState<ErrMsg>({
                                            message:"",
                                            status:""
                                        });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const onSubmitHandler = async (data: any) => {
       setIsSubmitting(true);

       const { confirmPassword, FirstName, LastName, ...restData } = data;

       const formattedData = {
        firstName: FirstName, 
        lastName: LastName, 
        ...restData
    };

       try {
            const res = await apiRequest({
                url: "auth/register",
                data: formattedData,
                method: "POST"
            });
            

            if (!res) {
                setErrMsg({message:"Something went wrong. Please try again.",
                    status:"failed"
                });
                return;
            }
            
            
            if ( res.status === "failed") {
                setErrMsg(res);
            } else {
                setErrMsg(res);
                setTimeout(() => {
                    window.location.replace("/login");
                }, 5000);
            }
            setIsSubmitting(false);
       } catch(error) {
        console.log(error);
        setIsSubmitting(false);
       }
    }

    return(
        <div className="bg-bgColor w-full h-[100vh] flex items-center justify-center p-6">
            <div className="w-full md:w-2/3 h-fit lg:h-full  2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-xl ">
            {/* Left*/}
                <div className="hidden w-1/2 h-full lg:flex flex-col items-center justify-center bg-bgNew ">
                    <div className="w-full flex items-center justify-center">
                        <img 
                            src="./img.jpg"
                            alt="img"
                            className="w-48 2xl:w-64 h-48 2xl:h-64 rounded-full object-cover"
                        /> 
                    </div>
                </div>
            {/* Right */}
                <div className="w-full lg:w-1/2 h-full p-10 2xl:px-20 flex flex-col justify-center">
                    <div className="w-full flex gap-2 items-center mb-6 justify-end pr-2 ">
                        <div className="bg-[#065ad8] rounded p-2 text-white ">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF">
                                <path d="M350-63q-46 0-82.5-24T211-153q-16 21-40.5 32.5T120-109q-51 0-85.5-35T0-229q0-43 28-77.5T99-346q-14-20-21.5-42.5T70-436q0-40 20.5-75t57.5-57q5 18 13.5 38.5T181-494q-14 11-22 26.5t-8 32.5q0 56 46 69t87 21l19 32q-11 32-19 54.5t-8 40.5q0 30 21.5 52.5T350-143q38 0 63-34t41-80q16-46 24.5-93t13.5-72l78 21q-9 45-22 103t-36.5 110.5Q488-135 449.5-99T350-63ZM120-189q17 0 28.5-11.5T160-229q0-17-11.5-28.5T120-269q-17 0-28.5 11.5T80-229q0 17 11.5 28.5T120-189Zm284-158q-46-41-83.5-76.5t-64.5-69q-27-33.5-41.5-67T200-629q0-65 44.5-109.5T354-783q4 0 7 .5t7 .5q-4-10-6-20t-2-21q0-50 35-85t85-35q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h14q60 0 102 38.5t50 95.5q-18-3-40.5-3t-41.5 2q-7-23-25.5-38T606-703q-35 0-54.5 20.5T498-623h-37q-35-41-54.5-60.5T354-703q-32 0-53 21t-21 53q0 23 13 47.5t36.5 52q23.5 27.5 57 58.5t74.5 67l-57 57Zm76-436q17 0 28.5-11.5T520-823q0-17-11.5-28.5T480-863q-17 0-28.5 11.5T440-823q0 17 11.5 28.5T480-783ZM609-63q-22 0-43.5-6T524-88q11-14 22-33t20-35q11 7 22 10t22 3q32 0 53.5-22.5T685-219q0-19-8-41t-19-54l19-32q42-8 87.5-21t45.5-69q0-40-29.5-58T716-512q-42 0-98 16t-131 41l-21-78q78-25 139-42t112-17q69 0 121 41t52 115q0 25-7.5 47.5T861-346q43 5 71 39.5t28 77.5q0 50-34.5 85T840-109q-26 0-50.5-11.5T749-153q-20 42-56.5 66T609-63Zm232-126q17 0 28-11.5t11-28.5q0-17-11.5-29T840-270q-17 0-28.5 11.5T800-230q0 17 12 29t29 12Zm-721-40Zm360-594Zm360 593Z"/>
                            </svg>
                        </div>
                        <span className="text-2xl text-[#065ad8] ">
                            Connect
                        </span>
                    </div>

                    <p className=" text-ascent-1 font-semibold text-right pr-2">
                        Create your Account
                    </p>

                    <form className="py-8 flex flex-col gap-5"
                        onSubmit={handleSubmit(onSubmitHandler)}
                    >
                        <div className="w-full flex gap-2">
                            <TextInput 
                                name="firstName"
                                placeholder="John"
                                type="text"
                                label="First Name"
                                register={
                                    register("firstName", {
                                        required: "First Name required"
                                    })
                                }
                                styles="w-full "
                                labelStyles="ml-2"
                                error= {errors.FirstName ? String(errors.FirstName.message) : ""}
                            />
                            <TextInput 
                                name="lastName"
                                placeholder="Doh"
                                type="text"
                                label="Last Name"
                                register={
                                    register("lastName", {
                                        required: "Last Name required"
                                    })
                                }
                                styles="w-full  "
                                labelStyles="ml-2"
                                error= {errors.LastName ? String(errors.LastName.message) : ""}
                            />
                        </div>

                        <TextInput 
                            name="email" 
                            placeholder="john@email.com" 
                            type="email"
                            label="Email Address"
                            register={
                                register("email", {
                                    required: "Email Address required"
                                })
                            }  
                            styles="w-full "
                            labelStyles="ml-2"
                            error= {errors.email ? String(errors.email.message) : "" }
                        />

                        <div className="flex gap-2">
                            <TextInput 
                                name="password"
                                placeholder="password"
                                type="password"
                                label="Password"
                                register={
                                    register("password", {
                                        required: "Password required"
                                    })
                                }
                                styles="w-full "
                                labelStyles="ml-2"
                                error= {errors.password ? String(errors.password.message) : ""}
                            />
                            <TextInput 
                                name="confirmPassword"
                                placeholder="password"
                                type="password"
                                label="Confirm Password"
                                register={
                                    register("confirmPassword", {
                                        validate: (value) => {
                                            const { password} = getValues();
                                            if (password != value) {
                                                return "Password do not match"
                                            }
                                        }
                                    })
                                }
                                styles="w-full  "
                                labelStyles="ml-2"
                                error= {errors.confirmPassword ? String(errors.confirmPassword.message) : ""}
                            />
                        </div>

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

                        {
                            !isSubmitting ? (
                                <CustomButton 
                            title="Create Account" 
                            type="submit" 
                            containerStyles={`inline flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none `}
                        />
                            ) : <Loading/>
                        } 
                    </form>
                    <p  className="text-ascent-2 text-sm text-center">
                        Allready have an account?
                        <Link 
                            to='/login'
                            className="text-[#065ad8] font-semibold ml-2 cursor-pointer"
                            >
                            Login
                        </Link>
                    </p>
                </div>
                
            </div>

        </div>
    )
}