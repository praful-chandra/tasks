const temp = require("../../tempMock");

test('mocks a demo npm module', () => {
        const res = temp.funct();

        expect(res).toEqual(2);

});