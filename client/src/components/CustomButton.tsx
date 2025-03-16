import { FC } from "react";

interface CustomButton {
    title: string;
    containerStyles?: string;
    iconRight?: React.ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }

export const CustomButton: FC<CustomButton>  = ({title, containerStyles, iconRight, type, onClick}) => {
    return (
        <button
            onClick={onClick}
            type={type || "button"}
            className={`inline-flex items-center text-base ${containerStyles}`}
        >
            {title}
            {iconRight && <div className="ml-2">{iconRight}</div>}
        </button>
    )
}