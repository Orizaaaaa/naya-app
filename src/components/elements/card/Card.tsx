
type Props = {
    title?: string,
    padding?: string,
    children: React.ReactNode,
    className?: string
}
const Card = ({ children, padding = 'p-4 lg:px-7.5 lg:py-4', className }: Props) => {
    return (
        <div className={`rounded-lg bg-white ${padding}  shadow-default dark:border-strokedark ${className}`}>
            <div className=" rounded-full ">
                {children}
            </div>
        </div>
    )
}

export default Card