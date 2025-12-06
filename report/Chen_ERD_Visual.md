# Chen Notation ER Diagram (Visual Representation)

This diagram uses standard flowchart symbols to represent Chen Notation elements:
- **Rectangle**: Entity
- **Diamond**: Relationship
- **Oval (Stadium)**: Attribute
- **Lines**: Connections with Cardinality (1, N)

```mermaid
flowchart TD
    %% Styling
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef relation fill:#fce4ec,stroke:#880e4f,stroke-width:2px,shape:diamond;
    classDef attribute fill:#f3e5f5,stroke:#4a148c,stroke-width:1px,shape:stadium;

    %% Entities
    User[User]:::entity
    Provider[Provider]:::entity
    Service[Service]:::entity
    Booking[Booking]:::entity
    Review[Review]:::entity
    Payment[Transaction]:::entity

    %% Attributes: User
    User_ID([id<br><u>PK</u>]):::attribute
    User_Name([name]):::attribute
    User_Email([email]):::attribute
    User_Phone([phone]):::attribute
    User_Role([role]):::attribute
    User_Pass([passwordHash]):::attribute
    
    %% Attributes: Provider
    Prov_ID([id<br><u>PK</u>]):::attribute
    Prov_Biz([businessName]):::attribute
    Prov_Desc([description]):::attribute
    Prov_Cat([category]):::attribute
    Prov_Stat([status]):::attribute
    Prov_City([city]):::attribute
    Prov_Rate([averageRating]):::attribute
    
    %% Attributes: Service
    Serv_ID([id<br><u>PK</u>]):::attribute
    Serv_Title([title]):::attribute
    Serv_Desc([description]):::attribute
    Serv_Price([price]):::attribute
    Serv_Dur([durationMin]):::attribute
    
    %% Attributes: Booking
    Book_ID([id<br><u>PK</u>]):::attribute
    Book_Date([scheduledAt]):::attribute
    Book_Stat([status]):::attribute
    Book_Amt([totalAmount]):::attribute
    Book_Addr([address]):::attribute
    
    %% Attributes: Review
    Rev_ID([id<br><u>PK</u>]):::attribute
    Rev_Rate([rating]):::attribute
    Rev_Comm([comment]):::attribute
    
    %% Attributes: Payment
    Pay_ID([id<br><u>PK</u>]):::attribute
    Pay_Amt([amount]):::attribute
    Pay_Stat([status]):::attribute
    Pay_Method([gateway]):::attribute

    %% Relationships
    User -- 1 --> Has{Has}:::relation
    Has -- 1 --> Provider
    
    User -- 1 --> Makes{Makes}:::relation
    Makes -- N --> Booking
    
    Provider -- 1 --> Offers{Offers}:::relation
    Offers -- N --> Service
    
    Provider -- 1 --> Receives{Receives}:::relation
    Receives -- N --> Booking
    
    Service -- 1 --> IncludedIn{IncludedIn}:::relation
    IncludedIn -- N --> Booking
    
    Booking -- 1 --> Generates{Generates}:::relation
    Generates -- 1 --> Payment
    
    Booking -- 1 --> HasReview{HasReview}:::relation
    HasReview -- 1 --> Review

    %% Connections to Attributes
    User --- User_ID & User_Name & User_Email & User_Phone & User_Role & User_Pass
    Provider --- Prov_ID & Prov_Biz & Prov_Desc & Prov_Cat & Prov_Stat & Prov_City & Prov_Rate
    Service --- Serv_ID & Serv_Title & Serv_Desc & Serv_Price & Serv_Dur
    Booking --- Book_ID & Book_Date & Book_Stat & Book_Amt & Book_Addr
    Review --- Rev_ID & Rev_Rate & Rev_Comm
    Payment --- Pay_ID & Pay_Amt & Pay_Stat & Pay_Method
```
