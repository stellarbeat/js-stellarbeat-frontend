// needed for web workers
declare module 'worker-loader*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}
