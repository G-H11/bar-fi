// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YourCollectible is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Royalty,
    Ownable,
    ReentrancyGuard
{
    uint256 public tokenIdCounter;

    // 累计的上架费用
    uint256 public totalFeesCollected;

    struct NftItem {
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool isListed;
        string tokenUri;
    }

    // Token ID到NftItem的映射
    mapping(uint256 => NftItem) private _idToNftItem;

    // 维护所有上架的tokenId数组
    uint256[] private _listedTokenIds;
    // tokenId到_listedTokenIds数组索引的映射
    mapping(uint256 => uint256) private _tokenIdToListedIndex;

    // 上架费用比例（例如250代表2.5%）
    uint256 public listingFeePercentage = 250; // 2.5%
    uint256 public constant MAX_LISTING_FEE_PERCENTAGE = 1000; // 最多10%

    // 事件
    event NftListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event NftUnlisted(uint256 indexed tokenId, address indexed seller);
    event NftPurchased(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        address royaltyReceiver,
        uint256 royaltyAmount
    );
    event ListingFeePercentageUpdated(uint256 newListingFeePercentage);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor() ERC721("YourCollectible", "YCB") Ownable(msg.sender) {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://jade-obedient-crane-756.mypinata.cloud/ipfs/";
    }

    /**
     * @dev 铸造新的NFT
     * @param to 接收者地址
     * @param uri NFT的元数据URI
     * @return tokenId 新铸造的NFT的Token ID
     */
    function mintItem(
        address to,
        string memory uri,
        uint96 royaltyFeeNumber
    ) public returns (uint256) {
        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        //设置版税信息
        _setTokenRoyalty(tokenId, msg.sender, royaltyFeeNumber);

        // 拼接完整的 tokenURI
        string memory completeTokenURI = string(
            abi.encodePacked(_baseURI(), uri)
        );

        _idToNftItem[tokenId] = NftItem({
            tokenId: tokenId,
            price: 0,
            seller: payable(address(0)),
            isListed: false,
            tokenUri: completeTokenURI
        });

        return tokenId;
    }

    /**
     * @dev 批量铸造NFT
     * @param to 接收者地址
     * @param uris NFT的元数据URI数组
     * @param royaltyFeeNumber 每个NFT的版税数量
     * @param quantity 铸造数量
     * @return mintedTokenIds 新铸造的NFT的Token ID数组
     */
    function mintBatch(
        address to,
        string[] memory uris,
        uint96 royaltyFeeNumber,
        uint256 quantity
    ) public returns (uint256[] memory) {
        require(
            uris.length == quantity,
            "URI length must be equal to quantity"
        );
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= 20, "Exceeded max batch size of 20");

        uint256[] memory mintedTokenIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; i++) {
            tokenIdCounter++;
            uint256 tokenId = tokenIdCounter;

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            _setTokenRoyalty(tokenId, msg.sender, royaltyFeeNumber);

            string memory completeTokenURI = string(
                abi.encodePacked(_baseURI(), uris[i])
            );

            _idToNftItem[tokenId] = NftItem({
                tokenId: tokenId,
                price: 0,
                seller: payable(address(0)),
                isListed: false,
                tokenUri: completeTokenURI
            });

            mintedTokenIds[i] = tokenId;
        }

        return mintedTokenIds;
    }

    /**
     * @dev 将NFT上架
     * @param tokenId 要上架的NFT的Token ID
     * @param price 上架的价格，单位为wei
     */
    function placeNftOnSale(
        uint256 tokenId,
        uint256 price
    ) external payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        require(!_idToNftItem[tokenId].isListed, "Item is already on sale");
        require(
            msg.value == calculateListingFee(price),
            "Incorrect listing fee"
        );

        // 将NFT转移到合约中进行托管
        _transfer(msg.sender, address(this), tokenId);

        // 更新NftItem信息
        _idToNftItem[tokenId] = NftItem({
            tokenId: tokenId,
            price: price,
            seller: payable(msg.sender),
            isListed: true,
            tokenUri: tokenURI(tokenId)
        });

        // 将tokenId添加到listedTokenIds数组，并记录其索引
        _listedTokenIds.push(tokenId);
        _tokenIdToListedIndex[tokenId] = _listedTokenIds.length - 1;

        totalFeesCollected += msg.value;

        emit NftListed(tokenId, msg.sender, price);
    }

    /**
     * @dev 将NFT下架
     * @param tokenId 要下架的NFT的Token ID
     */
    function unlistNft(uint256 tokenId) external nonReentrant {
        NftItem storage item = _idToNftItem[tokenId];
        require(item.isListed, "Item is not listed");
        require(item.seller == msg.sender, "You are not the seller");

        // 将NFT转回卖家
        _transfer(address(this), msg.sender, tokenId);

        // 重置NftItem信息
        item.isListed = false;
        item.price = 0;
        item.seller = payable(address(0));

        // 从listedTokenIds数组中移除tokenId
        _removeFromListed(tokenId);

        emit NftUnlisted(tokenId, msg.sender);
    }

    /**
     * @dev 购买NFT
     * @param tokenId 要购买的NFT的Token ID
     */
    function purchaseNft(uint256 tokenId) external payable nonReentrant {
        NftItem storage item = _idToNftItem[tokenId];
        require(item.isListed, "Item is not listed for sale");
        require(msg.value >= item.price, "Payment must be at least the price");
        require(item.seller != msg.sender, "You are the seller");

        // 取消上架并更新状态
        item.isListed = false;

        uint256 royaltyAmount = 0;
        address royaltyReceiver;

        //获取版税接受者地址
        (royaltyReceiver, ) = royaltyInfo(tokenId, msg.value);

        if (item.seller != royaltyReceiver) {
            (royaltyReceiver, royaltyAmount) = royaltyInfo(tokenId, msg.value);
            if (royaltyAmount > 0) {
                // 将版税金额转给版税接受者
                (bool royaltyPaid, ) = payable(royaltyReceiver).call{
                    value: royaltyAmount
                }("");
                require(royaltyPaid, "Failed to pay royalty");
            }
        }
        // 记录卖家的地址
        address payable seller = item.seller;
        uint256 price = item.price;

        // 重置卖家信息
        item.seller = payable(address(0));
        item.price = 0;

        // 从listedTokenIds数组中移除tokenId
        _removeFromListed(tokenId);

        // 计算卖家得到的转账金额
        uint256 sellerAmount = msg.value - royaltyAmount;
        (bool success, ) = seller.call{ value: sellerAmount }("");
        require(success, "Transfer to seller failed");

        // 将NFT转给买家
        _transfer(address(this), msg.sender, tokenId);

        emit NftPurchased(
            tokenId,
            seller,
            msg.sender,
            price,
            royaltyReceiver,
            royaltyAmount
        );
    }

    /**
     * @dev 获取NftItem信息
     * @param tokenId 要查询的NFT的Token ID
     * @return NftItem结构体
     */
    function getNftItem(uint256 tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    /**
     * @dev 设置新的上架费用比例（仅合约所有者可调用）
     * @param _newListingFeePercentage 新的上架费用比例（例如250代表2.5%）
     */
    function setListingFeePercentage(
        uint256 _newListingFeePercentage
    ) external onlyOwner {
        require(
            _newListingFeePercentage <= MAX_LISTING_FEE_PERCENTAGE,
            "Listing fee cannot exceed 10%"
        );
        listingFeePercentage = _newListingFeePercentage;
        emit ListingFeePercentageUpdated(_newListingFeePercentage);
    }

    /**
     * @dev 获取当前上架的NFT数量
     */
    function getListedItemsCount() external view returns (uint256) {
        return _listedTokenIds.length;
    }

    /**
     * @dev 从上架列表中移除tokenId
     * @param tokenId 要移除的tokenId
     */
    function _removeFromListed(uint256 tokenId) internal {
        uint256 index = _tokenIdToListedIndex[tokenId];
        uint256 lastTokenId = _listedTokenIds[_listedTokenIds.length - 1];

        // 将要移除的tokenId与最后一个tokenId交换
        _listedTokenIds[index] = lastTokenId;
        _tokenIdToListedIndex[lastTokenId] = index;

        // 删除最后一个元素
        _listedTokenIds.pop();

        // 删除映射中的条目
        delete _tokenIdToListedIndex[tokenId];
    }

    /**
     * @dev 获取所有上架的NFT
     * @return An array of NftItem structs
     */
    function getAllListedNfts() external view returns (NftItem[] memory) {
        uint256 totalListed = _listedTokenIds.length;
        NftItem[] memory items = new NftItem[](totalListed);
        for (uint256 i = 0; i < totalListed; i++) {
            uint256 tokenId = _listedTokenIds[i];
            items[i] = _idToNftItem[tokenId];
        }
        return items;
    }

    /**
     * @dev 计算上架费用
     * @param priceInWei NFT的售价，单位为wei
     * @return fee 上架费用，单位为wei
     */
    function calculateListingFee(
        uint256 priceInWei
    ) public view returns (uint256) {
        uint256 fee = (priceInWei * listingFeePercentage) / 10000;
        return fee;
    }

    /**
     * @dev 提现累积的上架费用（仅合约所有者可调用）
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");

        totalFeesCollected = 0;

        (bool success, ) = owner().call{ value: amount }("");
        require(success, "Withdrawal failed");

        emit FeesWithdrawn(owner(), amount);
    }

    // ---- OpenZeppelin v5 必须的 override 函数 ----

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
