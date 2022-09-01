import axios from 'axios';
import { Agent as HttpAgent, AgentOptions } from 'http';
import { Agent as HttpsAgent } from 'https';
import yn from 'yn';

const agentOptionsKeepAlive: AgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
};

const axiosInstanceConnectionClose = axios.create({});

const axiosInstanceKeepAlive = axios.create({
  httpAgent: new HttpAgent(agentOptionsKeepAlive),
  httpsAgent: new HttpsAgent(agentOptionsKeepAlive),
});

makeRequests({ keepAlive: yn(process.env.KEEP_ALIVE, { default: false }) });

setInterval(
  () => makeRequests({ keepAlive: yn(process.env.KEEP_ALIVE) }),
  parseInt(process.env.INTERVAL) * 1000 || 10000,
);

function makeRequests({ keepAlive }: { keepAlive: boolean }) {
  console.log(`-=next iteration ${new Date().toISOString()} =-`);

  Array(parseInt(process.env.CONCURRENCY) || 10)
    .fill(null)
    .map(() => {
      (keepAlive ? axiosInstanceKeepAlive : axiosInstanceConnectionClose)
        .get(process.env.URL || 'http://www.gazeta.pl', {
          maxRedirects: 0,
          validateStatus: (status) => {
            return status >= 200 && status < 400;
          },
        })
        .then((result) => {
          console.log(`${result.status} ${result.statusText}`);
        });
    });
}

const signals: Record<string, number> = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, async () => {
    const exitSignal = signals[signal] + 128;

    process.on('exit', () =>
      console.log(
        `[${new Date().toISOString()}] exiting with signal ${exitSignal}`,
      ),
    );

    process.exit(exitSignal);
  });
});
