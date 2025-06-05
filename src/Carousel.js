import React, { useEffect, useState} from 'react';
import MultiCarousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';


const Carousel = () => {
    
    const responsive = {
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024
            },
            items: 3,
            partialVisibilityGutter: 40
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464
            },
            items: 2,
            partialVisibilityGutter: 30
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0
            },
            items: 1,
            partialVisibilityGutter: 30
        },
    };

     
        return (
            <div>
           
                <MultiCarousel
                    responsive={responsive}
                    additionalTransfrom={0}
                    arrows
                    autoPlay
                    autoPlaySpeed={1000}
                    centerMode={false}
                    className=""
                    containerClass="container-with-dots"
                    dotListClass=""
                    draggable
                    focusOnSelect={false}
                    infinite
                    itemClass=""
                    keyBoardControl
                    minimumTouchDrag={80}
                    pauseOnHover
                    renderArrowsWhenDisabled={false}
                    renderButtonGroupOutside={false}
                    renderDotsOutside={false}
                    rewind={false}
                    rewindWithAnimation={false}
                    rtl={false}
                    shouldResetAutoplay
                    showDots={false}
                    sliderClass=""
                    slidesToSlide={2}
                    swipeable
                >
                    <div><img src="/images/Banana-Coconut-Cookies.jpg" alt="Girl in a jacket" width="325" height="250" /> </div>
                    <div><img src="/images/chickpea-spinach-curry.jpg" alt="Girl in a jacket" width="325" height="250" /> </div>
                    <div><img src="/images/banana-donuts.jpg" alt="Girl in a jacket" width="325" height="250" /> </div>
                    <div><img src="/images/chocolate_cupcakes.jpg" alt="Girl in a jacket" width="325" height="250" /> </div>
                     
                </MultiCarousel>
            </div>
        );
};
export default Carousel;