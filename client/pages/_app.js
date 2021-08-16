import 'bootstrap/dist/css/bootstrap.css';
import '../styles/style.css';

// Next does not just take your component and show it on the screen. instead it wraps it up inside of its own custom default Component - _app, which is referred to app inside next. this is our own custom component
// {Component} is the component in the pages that we are displaying and pageProps is its own props.
// if you want to include global css in our project, we can only import into this _app file.
// this file always load up when the user visits our application

const AppComponent = ({ Component, pageProps }) => {
    return (<Component {...pageProps} />);
};


export default AppComponent;