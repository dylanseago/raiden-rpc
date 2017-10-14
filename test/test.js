const chai = require('chai');
const ethAddress = require('ethereum-address');
const { RaidenNode } = require('../index.js');

const { expect } = chai;

const raidenEndpoints = ['http://localhost:5001', 'http://localhost:5002'];
const testnetToken = '0x0f114a1e9db192502e7856309cc899952b3db1ed';
const settleTimeout = 100;
const revealTimeout = 30;

function expectEthAddress(address) {
  expect(ethAddress.isAddress(address)).to.be.true;
}

describe('RaidenNode', () => {
  const nodes = raidenEndpoints.map(ep => new RaidenNode(ep));

  nodes.forEach((node, index) => {
    describe(`node[${index}]`, () => {
      describe('#getAddress()', () => {
        it('should return valid address', () =>
          node.getAddress().then((address) => {
            expectEthAddress(address);
            node.address = address;
          }));
      });

      describe('#getRegisteredTokens()', () => {
        it('should return testnetToken', () =>
          node.getRegisteredTokens().then((tokens) => {
            expect(tokens).to.include(testnetToken);
          }));
      });

      describe('#joinNetwork()', () => {
        it('should connect to testnetToken network', () =>
          node.joinNetwork(testnetToken, 40));
      });

      describe('#leaveNetwork()', () => {
        it('should leave the testnetToken network without receiving anything', () =>
          node.leaveNetwork(testnetToken, false));
      });
    });
  });

  describe.skip('#openChannel()', () => { // openChannel broken on parity -> https://github.com/raiden-network/raiden/issues/879
    it('node[0] should open channel with node[1]', () =>
      nodes[0].openChannel(nodes[1].address, testnetToken, 40, settleTimeout, revealTimeout)
        .then((resp) => {
          expectEthAddress(resp.channel_address);
          expect(resp.state).to.eql('open');
        }));
  });
});
