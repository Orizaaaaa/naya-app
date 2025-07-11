type Props = {
    htmlFor: string;
    title?: string;
    type: string;
    onChange: any;
    value: number | string;
    placeholder?: string;
    className?: string;
    styleTitle?: string;
    marginDiown?: string;
    errorMsg?: string;
};

function InputForm({
    htmlFor,
    errorMsg,
    marginDiown = 'mb-2',
    title,
    type,
    onChange,
    value,
    placeholder,
    className,
    styleTitle
}: Props) {
    return (
        <div className={marginDiown}>
            {title && (
                <label htmlFor={htmlFor} className={`${styleTitle}`}>
                    {title}
                </label>
            )}
            <input
                className={`h-10 p-4 rounded-md outline-none w-full  ${errorMsg ? 'border-2 border-red' : ''
                    } ${className}`}
                type={type}
                name={htmlFor}
                onChange={onChange}
                value={value}
                placeholder={placeholder}
            />
            {errorMsg && <p className="text-sm text-red-800">{errorMsg}</p>}
        </div>
    );
}

export default InputForm;
