import UIDGenerator from 'uid-generator';

const uidGen = new UIDGenerator();

export const generateTokenAsync = async () => await uidGen.generate();
export const generateTokenSync = () => uidGen.generateSync();

