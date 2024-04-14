import JSEncrypt from 'jsencrypt/bin/jsencrypt';

const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp0sW/+ZyRozi+gXOpMxm\n' +
  'zGqeRsD1kp+FeSpjcX1tNZqjiutNADxVsyoDinVWGljAmgKAw0cDjPmGX3K251UH\n' +
  'WPbsMRqLps3PnJZDyWX/hNEGG/ptykOKK8qo56385vcqSnooOq19RostYvO5bbSg\n' +
  'QHHfyczAYUaLf2v9BZr1PcDqWCSWhMVm6AtfMOfLmCmYfa4L/niSh3Qc1everJT1\n' +
  'AwTYPH1NGAx2oNGuljVH3jp7vcr7Jzw+0Tm8oVOmV7hWd4fG7LbJABGZmNwrKl6+\n' +
  '8mTTl+jNeW+o39Mfq4xdYKpI4wfgWfFqv/FumxZLiOXX5MCMoRP7p/aA9siLtDOr\n' +
  'sQIDAQAB';

export default function(word: string) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(word);
}
