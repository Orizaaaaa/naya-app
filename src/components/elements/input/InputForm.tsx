type Props = {
    htmlFor: string
    title?: string
    type: string
    onChange: any
    value: number | string
    placeholder?: string,
    className?: string
    styleTitle?: string
}

function InputForm({ htmlFor, title, type, onChange, value, placeholder, className, styleTitle }: Props) {
    return (
        <div className={`mb-3 `} >
            <label htmlFor={htmlFor} className={`${styleTitle}`}>
                {title}
            </label>
            <input
                className={`h-10 p-4 mt-1 rounded-md outline-none w-full  ${className}`}
                type={type}
                name={htmlFor}
                onChange={onChange}
                value={value}
                placeholder={placeholder}
            />
        </div>
    )
}

export default InputForm