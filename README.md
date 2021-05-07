# Documentation for @iota/poex-tool
**@iota/poex-tool** its a small library and a command line tool that wraps commons functionalities that someone needs for building Proof of Existence kind of apps, this library have been used in this [Proof of existence Poc](https://iota-poex.dag.sh) - [code source](https://github.com/iotaledger/poc-document-immutable-blueprint)

# Getting started
```
npm i @iota/poex-tool
```

# API

The Library exports a couple of APIs listed below:


* async publish(fileHash, tag, provider)
* async fetch(messageId, provider)
* async function verify(messageId, isBinaryInput, docpath, provider)
* hash(agnosticData, isBinaryInput)

It also provides backwards compatibility with the legacy network to verify previously issued proofs.

* async publishLegacy(publishOptions)
* async fetchLegacy(fetchOptions)
* async verifyLegacy(fetchOptions, isBinaryInput, docpath)

The legacy fetch-and publishOptions can be viewed [here](https://github.com/iotaledger/iota-poex-tool/src/models)


When using the CMD these network-related parameters of the functions default to [these values](https://github.com/iotaledger/iota-poex-tool/src/config.json)


## Sample codes

```
import { verify, hash, publish } from '@iota/poex-tool'
// ...
try {
// Publishing to Tangle and putting the result to Clipboard
const retArr = await publish({
      provider,
      data,
      tag,
      address,
      seed,
      depth,
      minWeightMagnitude
    })
    console.log(`TX Hash=${retArr[0].hash}`)
 } catch(e) {
    console.log(`something went wrong ${e}`)
 }



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
> node cmd.js hash /home/myContract.doc
myContract.doc hash = afeea52aa284ffa2110f2feaa67fffff2
```
Please note when using this in web you have to use the **-b** flag to mark it as Binary data, otherwise it will be treated as *path*!

Then we issue a proof of existence of the file, meaning we save the current hash of the file, e.g. its current state, by publishing it on the Tangle.

```
> node cmd.js publish afeea52aa284ffa2110f2feaa67fffff2
MessageId = 0988e59a1ac52ac0d5397f48d9357f8c2819abf48235d964fdd89317475bff35  
```

We can now verify the file integrity by comparing a hash value with the hash-value stored in some proof-of-existence on the Tangle.
```
> node cmd.js verify /home/myContract.doc 0988e59a1ac52ac0d5397f48d9357f8c2819abf48235d964fdd89317475bff35 
true
```

For simplicity, we have used all the defaults parameters but we could also use all of these flags if we wanted too:

* -p, --provider [provider]
* -s, --seed [seed]
* -a, --address [address]
* -m, --magnitude [magnitude]
* -d, --depth [depth]
* -t, --tag
* -f, --full 

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

*true* means the document is the same as the original, and no-one has tampered with it!




That is it for now, we have covered the basic of Proof of existance using Tangle as a source of truth.
