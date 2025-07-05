
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper } from "swiper/react"


const CaraoselImage = ({ children }: any) => {
    return (
        <Swiper
            spaceBetween={10}
            pagination={{
                clickable: true,
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper h-full rounded-lg"
        >
            {children}
        </Swiper>
    )
}

export default CaraoselImage