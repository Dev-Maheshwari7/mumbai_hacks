import React from "react";
import { components, cx } from "../styles/theme"; // adjust path if needed
import { HiExclamationTriangle } from "react-icons/hi2";

const ConfirmDialog = ({
    open,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Yes, Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">

            {/* BACKGROUND OVERLAY */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"></div>

            {/* DIALOG BOX */}
            <div className="
                relative bg-white 
                rounded-2xl 
                p-6 
                w-full max-w-lg 
                shadow-xl 
                animate-scaleIn
                border border-gray-100
            ">
                {/* Icon */}
                <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <HiExclamationTriangle className="text-red-600 text-3xl" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-gray-700 text-sm text-center mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-3">
                    {/* Cancel Button (Ghost Style) */}
                    <button
                        onClick={onCancel}
                        className={cx(
                            components.button.ghost,
                            "py-2 px-5 rounded-lg text-sm"
                        )}
                    >
                        {cancelText}
                    </button>

                    {/* Confirm Button (Danger Theme Red Button) */}
                    <button
                        onClick={onConfirm}
                        className={cx(
                            components.button.danger,
                            "py-2 px-5 rounded-lg text-sm"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
