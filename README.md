> Currently this package uses the experimental iota.js-library. While it is functionally complete, it will not be as heavily maintained in the future as iota.rs. However, as this package requires to compile within the browser, iota.js is the suitable option for now.

# Documentation for @iota/poex-tool
**@iota/poex-tool** is a small library and a command line tool that wraps common functionalities that would be needed for building Proof of Existence (PoE) kind of apps
This library have been used in this [Proof of Existence PoC](https://iota-poex.dag.sh) - [code source](https://github.com/iotaledger/poc-document-immutable-blueprint)

# Getting started
```
npm i @iota/poex-tool
```

# API

The Library exports a couple of APIs listed below:


* async publish(fileHash, tag, provider): messageId-string
* async fetch(messageId, provider): SHA-256-hash-string
* async function verify(messageId, isBinaryInput, docpath, provider): boolean
* hash(agnosticData, isBinaryInput): SHS-256-hash-string

Please not that the method signature of the publish-function changed from legacy to Chrysalis network! It now simply returns the messageId instead of an ```Transaction```-array
It also provides backwards compatibility with the legacy network to verify previously issued proofs.

* async fetchLegacy(fetchOptions): SHA-256-hash-string
* async verifyLegacy(fetchOptions, isBinaryInput, docpath): boolean

The legacy-fetch options can be viewed [here](https://github.com/iotaledger/iota-poex-tool/src/models)



## Sample codes

```
import { verify, hash, publish } from '@iota/poex-tool'
// ...

//Create the SHA-256 hash
const hash = hash("/home/myContract.doc", false);

const tag = "SAMPLE_MESSAGE_INDEX";
const provider = "PERMANODE_PROVIDER";
let messageId;
try {
  // Publish to Tangle and log the result
  messageId = await publish(hash, tag, provider)
  console.log(`Published PoE in messageId ${messageId}`)
  //In case this would have been a legacy operation: console.log(`TX Hash=${retArr[0].hash}`)
} 
catch(e) {
  console.log(`something went wrong ${e}`)
}



//...

// Verifying if the file matches the previous signed one then reflecting the result into a React state

const verified = await verify(messageId, false, "/home/myContract.doc", provider)
this.setState({ isLoading: false, docMutated: verified })

```

## Command line tool

All the functions are available via command line tool - very useful for quick testing and instant Tangle interaction. Please open a console terminal and navigate to the ```/src``` directory.
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

* -p, --provider
* -a, --address [for legacy operations] 
* -t, --tag

When using the CMD these network-related parameters of the functions default to [these values](https://github.com/iotaledger/iota-poex-tool/src/config.json)


Now, let us use the fetch data from the Tangle.


```
> node cmd.js fetch 0988e59a1ac52ac0d5397f48d9357f8c2819abf48235d964fdd89317475bff35
Payload-data = afeea52aa284ffa2110f2feaa67fffff2
```
Again, here we have omitted all parameters thus using default ones.

Using the same default parameters, we were able to retrieve the exact data that was stored in the Tangle, now we could just calculate the file hash and compare it with this hash to determine whether the document has been changed since the PoE has been issued or not.

Even more easier we could also use a direct Command that performs a **verify**-operation for us:


```
> node cmd.js verify /home/myContract.doc
true
```

*true* means the document is the same as the original, and no-one has tampered with it!




That is it for now, we have covered the basic of Proof of existence using Tangle as a source of truth.
