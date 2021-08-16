import axios from 'axios';

const BuildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // request comes from the server
        return axios.create({
            // baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
            baseURL: 'http://www.ticketing-microservices-dev.xyz/',
            headers: req.headers
        });
    } else {
        // request comes from the browser
        return axios.create({
            baseUrl: '/'
        });
    }

};

export default BuildClient;