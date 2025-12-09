import React from 'react';
import Preloader from '../helper/Preloader';
import ColorInit from '../helper/ColorInit';
import ScrollToTop from 'react-scroll-to-top';
import Breadcrumb from '../components/Breadcrumb';
import ChatList from '../components/ChatList';

const ChatPage = () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      
      <Breadcrumb title="Messages" />
      
      <section className="py-80">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="border border-gray-100 rounded-16 overflow-hidden">
                <ChatList />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChatPage;