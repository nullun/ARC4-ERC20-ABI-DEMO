# ARC4 ABI compliant ERC20 implementation

This is purely for educational purposes and I don't encourage using it in any
projects or on Mainnet.
Algorand has a built-in native primative for creating tokens, the Algorand
Standard Asset (ASA), and should be the first consideration when creating an
ERC20-like token on Algorand.

Use only in a sandbox enviornment on a private network. You will need to update
the JSON file to contain your genesis hash and appID.

## Deploy
```sh
# Note: The creator has their local state set with the full balance on
# creation, so the OnCompletion must be OptIn.
goal app method -f $ADDRESS1 --create --on-completion OptIn \
	--approval-prog ERC20.teal --clear-prog clear.teal \
	--global-byteslices 2 --global-ints 2 --local-byteslices 0 --local-ints 16 \
	--method "deploy(string,string,uint64,uint64)bool" \
	--arg '"TestToken"' --arg '"TT"' --arg 10000 --arg 2
```

## Opt In
```sh
# As I write this I realise I haven't created an ARC4 method for opting in,
# such as using "_optIn()void". This is called a bare application call.
goal app optin -f $ADDRESS2 --app-id $APPID
```

## Transfer
```sh
# You may need to expand the second address for the arg before sending.
goal app method --app-id 49 -f $ADDRESS1 \
	--method "transfer(address,uint64)bool" \
	--app-account $ADDRESS2 \
	--arg '"$ADDRESS2"' --arg 5000
```

## Approve
```sh
# Here we allow $ADDRESS1 to spend up to 10.00 of $ADDRESS2's balance.
goal app method --app-id 49 -f $ADDRESS2 \
	--method "approve(address,uint64)bool" \
	--app-account $ADDRESS1 \
	--arg '"$ADDRESS1"' --arg 1000
```

## Transfer From
```sh
# Note that we don't need to explicitly put $ADDRESS1 in the --app-account
# arguments here as they're already in it by default, but if it was another
# address then it is required.
goal app method --app-id 49 -f $ADDRESS1 \
	--method "transferFrom(address,address,uint64)bool" \
	--app-account $ADDRESS2 --app-account $ADDRESS1 \
	--arg '"$ADDRESS2"' --arg '"$ADDRESS1"' --arg 500
```

And of course all the "view" methods work too, but if you were creating a
frontend it's unlikely that you'd actually want to submit these transactions to
see the results.

Pull requests welcome.

