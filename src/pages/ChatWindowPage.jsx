import React from 'react';
import Preloader from '../helper/Preloader';
import ColorInit from '../helper/ColorInit';
import ScrollToTop from 'react-scroll-to-top';
import Breadcrumb from '../components/Breadcrumb';
import ChatWindow from '../components/ChatWindow';

const ChatWindowPage = () => {
    return (
        <>
            <ColorInit color={true} />
            <ScrollToTop smooth color="#FA6400" />
            <Preloader />

            <Breadcrumb title="Chat" />

            <section className="py-80">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <ChatWindow />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ChatWindowPage;
