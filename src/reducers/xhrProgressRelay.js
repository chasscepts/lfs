//  Because we can't save a function in redux, we xhr progress relays here and save their id in redux.

let relays = [];

const newRelay = (id) => {
  const relay = Object.create(null);
  let sink = null;
  relay.id = id;
  relay.source = (loaded, total) => {
    if (sink) {
      sink(loaded, total);
    }
  };
  relay.subscribe = (callback) => {
    sink = callback;
  };
  relay.unsubscribe = () => sink = null;
  relays.push(relay);
  return relay;
};

const ProgressRelay = {
  createRelay: (id) => newRelay(id).source,
  removeRelay: (id) => {
    relays = relays.filter((r) => r.id !== id);
  },
  getRelay: (id) => relays.find((r) => r.id === id),
}

export default ProgressRelay;
