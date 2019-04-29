# Documentation for iota-proof-tool
**iota-proof-tool** its a small library and a command line tool that wraps commons functionalities that someone needs for building Proof of Existence kind of apps, this library have been used in this [Proof of existence Poc](https://build-vvzhlpnvdd.now.sh/).

# API

The Library exports a couple of few APIs listed below:


* publish(bundle, callBack)
* async fetch(bundle)
* async function verify(bundle, isBinaryInput, docpath, callBack)
* [Optional] hash(agnosticData, isBinaryInput)

## Bundle's properties

```
  {
  provider,
  data,
  seed,
  address,
  minWeightMagnitude,
  depth
  }
```

When using the CMD these bundles properties defaults to :

```
const dSeed = 'HEQLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORL9D'
const dAddress = 'MRDVKCDQAPYQOJEQTUWDMNYZKDUDBRNHJWV9VTKTCUUYQICLPFBETMYYVKEPFCXZE9EJZHFUWJZVEWUCWSGDUVMOYD'
const dProvider = 'https://altnodes.devnet.iota.org'
const dDepth = 3
const dMinWeightMagnitude = 14 // 9 for devenets
```

## Sample codes

```
import { verify, hash, publish } from 'iota-proof-tool'
// ...
// Publishing to Tangle and putting the result to Clipboard
    publish({
      provider,
      data,
      address,
      seed,
      depth,
      minWeightMagnitude
    }, (retArr) => {
      navigator.clipboard.writeText(retArr[0].hash).then(() => {
        /* clipboard successfully set */
        this.setState({
          genTxHash: retArr[0].hash,
          isLoading: false
        })
        alert('TX Hash has been copied to clipboard!')
      }, function() {
        alert('clipboard not supported, please copy manually the generated TX Hash')
      });

    })
//...

// Verifying if the file matches the previous signed one then reflecting the result into a React state

  const verified = await verify(bundle, true, file)
  this.setState({ isLoading: false, docMutated: verified })

```

## Command line tool

All the functions are available via command line tool - very useful for quick testing and instant Tangle interaction.
Here a quick demo:

Hashing the document is a necessary step but not necessarily done via this lib, however we highly recomend using it since it has been designed for easy usage/intergation with other functions:

```
> iotatool hash /home/myContract.doc
afeea52aa284ffa2110f2feaa67fffff2
```
Please note when using this in web you have to use the **-b** flag to mark it as Binary data, otherwise it will be treated as *path*!

Then we need to make this "safe" by publishing it to Tangle

```
> iotatool publish afeea52aa284ffa2110f2feaa67fffff2
TX Hash: OIC9B9TZEU9DTAPJ9XOJCQLIFLDRYANONPYWJI9VG9MMLFRKMIOENPSMNICJIQNKFMTQIMSSGOOJIH999
```
For simplicity, we have used all the defaults parameters but we could also use all of these flags if we wanted too:

* -p, --provider [provider]
* -s, --seed [seed]
* -a, --address [address]
* -m, --magnitude [magnitude]
* -d, --depth [depth]

That is all what we can do with signing documents, in the next section we are going to fetch data from the Tangle.


```
> iotatool fetch OIC9B9TZEU9DTAPJ9XOJCQLIFLDRYANONPYWJI9VG9MMLFRKMIOENPSMNICJIQNKFMTQIMSSGOOJIH999
tx value = afeea52aa284ffa2110f2feaa67fffff2
```
Again, here we have omitted all bundle parameters thus using default ones.
Using the same default parameters, we were able to retrieve the exact data that was stored in the Tangle, now we could just calculate the file hash and compare it with this Hash to say whether the document has been changed or not.

Even more easier we could also use a direct Command that does that for us **verify** fn :


```
> iotatool verify /home/myContract.doc
true
```

*true* means the document is same as original and no one has potentially tempted with!


That is it for now, we have covered the basic of Proof of existance using Tangle as a source of truth.
