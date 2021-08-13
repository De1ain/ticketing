import Header from './header';

const BaseLayout = ({ children, currentUser }) => {
    return (
        <div className="container">
            <Header currentUser={currentUser} />
            {children}
        </div>
    );
};

export {
    BaseLayout as default
};